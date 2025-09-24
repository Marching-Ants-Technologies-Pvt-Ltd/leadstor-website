self.onmessage = async function(e) {
    const { fileHandle, exportParams, token } = e.data;
    
    try {
        // Create writable stream
        const writable = await fileHandle.createWritable();
        
        let offset = exportParams.offset || 0;
        const chunkSize = 500; // Process 500 records at a time
        const totalToExport = exportParams.limit;
        let processedCount = 0;
        
        // Build base query parameters
        const baseParams = new URLSearchParams({
            testId: exportParams.testId,
            testName: exportParams.testName || '',
            testType: exportParams.testType || '',
            corporateId: exportParams.corporateId,
            corporateType: exportParams.corporateType || '',
            time: new Date().getTime()
        });

        // Add filters to query params
        if (exportParams.filters) {
            exportParams.filters.forEach(filter => {
                if (filter.field && filter.value) {
                    const fieldMapping = {
                        'status': 'status',
                        'source': 'source',
                        'course': 'course',
                        'location': 'location',
                        'owner': 'owner',
                        'leadProbability': 'leadProbability',
                        'qualification': 'qualification'
                    };
                    
                    const apiField = fieldMapping[filter.field] || filter.field;
                    
                    if (filter.field === 'course') {
                        baseParams.append(apiField, btoa(filter.value));
                    } else {
                        baseParams.append(apiField, filter.value);
                    }
                }
            });
        }

        // For smaller datasets, export directly
        if (totalToExport <= 500) {
            const queryParams = new URLSearchParams(baseParams);
            queryParams.set('offset', offset);
            queryParams.set('limit', totalToExport);
            
            const apiUrl = `${exportParams.apiBaseUrl}/services/invite/export?${queryParams.toString()}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const blob = await response.blob();
            await writable.write(blob);
            await writable.close();
            
            self.postMessage({ type: 'done', totalProcessed: totalToExport });
            return;
        }

        // For larger datasets, fetch in chunks and merge Excel files
        let isFirstChunk = true;
        let mergedWorkbook = null;
        let mergedWorksheet = null;

        while (processedCount < totalToExport) {
            const currentChunkSize = Math.min(chunkSize, totalToExport - processedCount);
            
            const queryParams = new URLSearchParams(baseParams);
            queryParams.set('offset', offset + processedCount);
            queryParams.set('limit', currentChunkSize);
            
            const apiUrl = `${exportParams.apiBaseUrl}/services/invite/export?${queryParams.toString()}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data chunk: ${response.statusText}`);
            }

            if (!self.XLSX) {
                // Dynamically import XLSX for large files only
                const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
                self.XLSX = XLSX;
            }

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const chunkWorkbook = self.XLSX.read(arrayBuffer);
            const chunkWorksheet = chunkWorkbook.Sheets[chunkWorkbook.SheetNames[0]];
            
            if (isFirstChunk) {
                mergedWorkbook = chunkWorkbook;
                mergedWorksheet = chunkWorksheet;
                isFirstChunk = false;
            } else {
                const chunkData = self.XLSX.utils.sheet_to_json(chunkWorksheet, { header: 1 });
                if (chunkData.length > 1) {
                    const dataRows = chunkData.slice(1);
                    self.XLSX.utils.sheet_add_aoa(mergedWorksheet, dataRows, { origin: -1 });
                }
            }

            processedCount += currentChunkSize;
            
            const progress = Math.round((processedCount / totalToExport) * 100);
            self.postMessage({ 
                type: 'progress', 
                progress,
                processed: processedCount,
                total: totalToExport
            });
        }

        const finalExcelBuffer = self.XLSX.write(mergedWorkbook, { type: 'array', bookType: 'xlsx' });
        await writable.write(new Uint8Array(finalExcelBuffer));
        await writable.close();
        
        self.postMessage({ type: 'done', totalProcessed: processedCount });
        
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ 
            type: 'error', 
            message: error.message || 'Unknown error occurred during export'
        });
    }
};
