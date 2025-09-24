import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { xFetch } from '@/utility/xFetch';
import { Corporate, User, Test } from '@/utility/TinyDB';

const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
  </svg>
);

const LightbulbIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a7 7 0 00-4.95 11.95c.2.2.32.47.32.75v.3a2.25 2.25 0 002.25 2.25h4.76a2.25 2.25 0 002.25-2.25v-.3c0-.28.12-.55.32-.75A7 7 0 0012 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </svg>
);

const ColumnReorderPopup = ({ isOpen, setIsOpen, columns, setColumns, setColumnOrder, fetchAndSetColumns, refreshTable, onReorder }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [tempColumns, setTempColumns] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);
  const dragOverTimeoutRef = useRef(null);
  const scrollSpeedRef = useRef(8);
  const editInputRef = useRef(null);
  const dragPreviewRef = useRef(null);
  const rafRef = useRef(null);
  const dragStartTimeRef = useRef(null);
  const lastDragOverRef = useRef(null);

  const cleanupAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Initialize temp columns when popup opens
  useEffect(() => {
    if (isOpen) {
      const columnsToUse = columns && columns.length > 0 ? columns : [];
      setTempColumns([...columnsToUse]);
      setHasChanges(false);
      setDraggedItem(null);
      setDraggedOver(null);
      setIsLoading(false);
      setEditingColumn(null);
      setEditingName('');
      setIsRenaming(false);
      setIsDragging(false);
      setDragPreview(null);
      lastDragOverRef.current = null;
    }
  }, [isOpen, columns]);

  // Add a mousemove event listener when isDragging is true
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging]);

  // Update drag preview position
  const updateDragPreview = useCallback((clientX, clientY) => {
    if (!dragPreviewRef.current) return;
    
    const preview = dragPreviewRef.current;
    const rect = preview.getBoundingClientRect();
    
    // Smooth position update with slight offset
    const x = clientX - dragOffset.x;
    const y = clientY - dragOffset.y;
    
    preview.style.transform = `translate(${x}px, ${y}px)`;
    preview.style.zIndex = '9999';
    
  }, [dragOffset]);

  // Global mouse move handler for smooth preview
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        updateDragPreview(e.clientX, e.clientY);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, updateDragPreview]);

  const handleDragStart = (e, index) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    setDraggedItem(index);
    setDraggedOver(null);
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
    dragStartTimeRef.current = Date.now();

    // Create drag preview
    const preview = element.cloneNode(true);
    preview.style.position = 'fixed';
    preview.style.pointerEvents = 'none';
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;
    preview.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px)`;
    preview.style.zIndex = '9999';
    preview.style.opacity = '0.9';
    preview.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    preview.style.borderRadius = '12px';
    preview.style.transition = 'none';

    document.body.appendChild(preview);
    setDragPreview(preview);
    dragPreviewRef.current = preview;

    // Hide original drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Update handleDragOver for real-time movement
  const handleDragOver = (e, overIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === overIndex) return;
    let newColumns = [...tempColumns];
    const [removed] = newColumns.splice(draggedItem, 1);
    newColumns.splice(overIndex, 0, removed);
    setTempColumns(newColumns);
    setDraggedItem(overIndex);
    setHasChanges(true);
  };

  const handleDragEnter = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;
    
    // Immediate response for better UX
    setDraggedOver(dropIndex);
  };

  const handleDragLeave = (e) => {
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
    
    // Only reset if not hovering over another drop target
    if (!e.relatedTarget || !e.relatedTarget.closest('.drop-target')) {
      setTimeout(() => {
      setDraggedOver(null);
      }, 100);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      handleDragEnd();
      return;
    }
    
    // Smooth reorder animation
    let newColumns = [...tempColumns];
    const draggedColumn = newColumns[draggedItem];
    
    // Remove and insert with smooth transition
    newColumns.splice(draggedItem, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setTempColumns(newColumns);
    setHasChanges(true);
    
    // Add success feedback
    if (Date.now() - dragStartTimeRef.current > 200) {
      navigator.vibrate && navigator.vibrate(50);
    }
    
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setDraggedOver(null);
    
    if (dragPreviewRef.current) {
      // Smooth fade out
      const preview = dragPreviewRef.current;
      preview.style.transition = 'opacity 0.2s ease-out';
      preview.style.opacity = '0';
      setTimeout(() => {
        if (preview.parentNode) {
          preview.parentNode.removeChild(preview);
        }
      }, 200);
      dragPreviewRef.current = null;
    }
    
    setDragPreview(null);
    
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
  };

  const getItemStyle = (index) => {
    const baseStyle = 'transition-all duration-200 ease-out';
    
    if (draggedItem === index) {
      return `${baseStyle} opacity-40 scale-95 transform`;
    }
    if (draggedOver === index) {
      return `${baseStyle} border-blue-300 bg-blue-50 shadow-md transform scale-102`;
    }
    return `${baseStyle} hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm`;
  };

  const getDraggedColumnName = () => {
    if (draggedItem !== null && tempColumns[draggedItem]) {
      return tempColumns[draggedItem].fieldName || tempColumns[draggedItem].name;
    }
    return '';
  };

  const resetColumns = async () => {
    if (!columns || columns.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const originalData = await xFetch({ 
        method: 'GET',
        path: '/services/profile/columns' 
      });
      
      if (!originalData || !Array.isArray(originalData)) {
        throw new Error('Invalid response from server');
      }
      
      setTempColumns([...originalData]);
      setHasChanges(false);
      
      if (setColumns) {
        setColumns([...originalData]);
      }
      
      const defaultOrder = originalData.map(col => col.dataField).filter(field => field !== 'action');
      if (setColumnOrder) {
        setColumnOrder(defaultOrder);
      }
      
      if (typeof window.tableRefresh === 'function') {
        window.tableRefresh();
      }
      
      if (fetchAndSetColumns) {
        try {
          await fetchAndSetColumns();
        } catch (error) {
          console.error('Failed to refresh columns:', error);
        }
      }
      
      toast.success('Columns reset to default!');
    } catch (error) {
      console.error('Failed to fetch original columns:', error);
      toast.error('Failed to reset columns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = async () => {
    if (!hasChanges) {
      setIsOpen(false);
      return;
    }
    setIsApplying(true);
    try {
      const sessionData = { corporate: Corporate, user: User, test: Test };
      const corporateId = sessionData?.corporate?.id || sessionData?.corporate?._id;
      
      const renamedColumns = tempColumns.filter((col, idx) => {
        const orig = columns[idx];
        return orig && (col.fieldName || col.name) !== (orig.fieldName || orig.name);
      });
      
      for (const col of renamedColumns) {
        if (col.fieldId && (col.fieldName || col.name)) {
          try {
            const response = await xFetch({
              method: 'POST',
              path: '/services/profile/updateColumnName',
              payload: {
                corporateId,
                fieldId: col.fieldId,
                fieldName: col.fieldName || col.name
              }
            });
            if (!response || !response.success) {
              throw new Error(response?.message || 'Failed to rename column');
            }
          } catch (error) {
            toast.error(`Failed to rename column '${col.fieldName || col.name}': ${error.message}`);
            setIsApplying(false);
            return;
          }
        }
      }
      
      if (corporateId && tempColumns.length > 0) {
        const reorderPayload = {
          corporateId,
          data: tempColumns.map((col, index) => ({
            fieldId: col.fieldId
          })).filter(item => item.fieldId)
        };
        try {
          const response = await xFetch({
            method: 'POST',
            path: '/services/profile/updateLeadTableReorder',
            payload: reorderPayload
          });
        } catch (error) {
          toast.error('Failed to save column order. Please try again.');
          setIsApplying(false);
          return;
        }
      }
      
      if (setColumns) {
        setColumns(tempColumns);
      }
      if (setColumnOrder) {
        setColumnOrder(tempColumns.map(col => col.dataField));
      }
      if (onReorder) {
        onReorder(tempColumns.map(col => col.dataField));
      }
      // fetchAndSetColumns is likely responsible for refreshing the main table data.
      // Calling it after a successful update is correct.
      if (fetchAndSetColumns) {
        try {
          await fetchAndSetColumns();
        } catch (error) {}
      }
      
      toast.success('Columns updated!');
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to apply changes: ${error.message || 'Please try again.'}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRenameStart = (index) => {
    const column = tempColumns[index];
    setEditingColumn(index);
    setEditingName(column.fieldName || column.name);
    setHasChanges(true);
    
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 100);
  };

  const handleRenameSave = () => {
    if (!editingName.trim()) {
      toast.error('Column name cannot be empty');
      return;
    }
    if (editingColumn !== null) {
      const updatedColumns = [...tempColumns];
      updatedColumns[editingColumn] = {
        ...updatedColumns[editingColumn],
        fieldName: editingName.trim()
      };
      setTempColumns(updatedColumns);
      setEditingColumn(null);
      setEditingName('');
      setHasChanges(true);
    }
  };

  const handleRenameCancel = () => {
    setEditingColumn(null);
    setEditingName('');
    setHasChanges(false);
  };

  const handleRenameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleClose = () => {
    handleDragEnd();
    setIsOpen(false);
    if (hasChanges) {
      setTempColumns([...columns]);
      setHasChanges(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
      if (dragPreviewRef.current && dragPreviewRef.current.parentNode) {
        dragPreviewRef.current.parentNode.removeChild(dragPreviewRef.current);
      }
    };
  }, []);

  // Auto-scroll logic for drag
  useEffect(() => {
    if (!isDragging) return;
    const handleAutoScroll = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const edgeThreshold = 40;
      const scrollSpeed = 16;
      if (mouseY - rect.top < edgeThreshold) {
        container.scrollTop -= scrollSpeed;
      } else if (rect.bottom - mouseY < edgeThreshold) {
        container.scrollTop += scrollSpeed;
      }
    };
    document.addEventListener('dragover', handleAutoScroll);
    return () => document.removeEventListener('dragover', handleAutoScroll);
  }, [isDragging]);

  return (
    <>
      <ToastContainer position="bottom-right" />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 relative" style={{ maxWidth: '380px' }}>
            {/* Title and Close Button */}
            <div className="px-6 pt-4 pb-1 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-500">Reorder or Rename Columns</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent -mr-2 transition-all"
                style={{ marginRight: '-0.7rem' }}
                onClick={handleClose}
                aria-label="Close"
                type="button"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-5 pt-1 max-h-[74vh] overflow-y-auto">
              {tempColumns.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-500">
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto mb-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="text-sm">Loading columns...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={scrollContainerRef} 
                  className="max-h-80 overflow-y-auto"
                  style={{ 
                    scrollbarWidth: 'thin', 
                    scrollbarColor: '#d1d5db transparent'
                  }}
                >
                  {/* Drop zone at the beginning */}
                  <div
                    className={`drop-target transition-all duration-300 ease-out flex items-center justify-center ${
                      draggedOver === 0
                        ? 'h-8 border-2 border-dotted border-gray-400 bg-gray-50 rounded-lg shadow-sm mb-1 scale-105'
                        : 'h-1 mb-1'
                    }`}
                    onDragOver={e => handleDragOver(e, 0)}
                    onDrop={e => handleDrop(e, 0)}
                    onDragEnter={e => handleDragEnter(e, 0)}
                    onDragLeave={handleDragLeave}
                  >
                    {draggedOver === 0 && (
                      <span className="text-gray-700 text-xs font-medium px-3 py-1 bg-gray-100 rounded-full shadow-sm">
                        Drop &quot;{getDraggedColumnName()}&quot; here
                      </span>
                    )}
                  </div>
                  
                  {tempColumns.map((column, index) => (
                    <div
                      key={column.dataField + '-' + index}
                      className={`w-full flex items-center rounded-xl px-4 py-2 mb-1 group relative cursor-default transition-all duration-200 bg-white border border-gray-300 ${
                        draggedItem === index ? 'bg-gray-200 shadow-lg z-10 opacity-80' : ''
                      }`}
                      style={{ transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)' }}
                    >
                      <span className="flex-1 text-gray-800 font-medium truncate">
                          {editingColumn === index ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={handleRenameKeyPress}
                                onBlur={handleRenameSave}
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                disabled={isRenaming}
                              />
                          ) : (
                            <span 
                            className="cursor-pointer transition-colors text-gray-800"
                              onDoubleClick={() => handleRenameStart(index)}
                              title="Double-click to rename"
                            >
                              {column.fieldName || column.name}
                            </span>
                          )}
                      </span>
                      {column.tag && (
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            column.tag === 'Diary' ? 'bg-blue-100 text-blue-600' :
                            column.tag === 'Sweets' ? 'bg-purple-100 text-purple-600' :
                            column.tag === 'Gluten' ? 'bg-pink-100 text-pink-600' :
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {column.tag}
                        </span>
                      )}
                      <button
                        className="ml-4 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={e => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => handleDragOver(e, index)}
                        onDrop={e => handleDrop(e, index)}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      </div>
                  ))}
                </div>
              )}

              {/* Info bar */}
              <div className="w-full flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-3 py-2 mb-0 mt-4">
                <LightbulbIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs">
                  <span className="font-semibold">Drag</span> to reorder columns. <span className="font-semibold">Double-click</span> column names to rename.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-0">
              <div className="flex items-baseline justify-between">
                <button
                  onClick={applyChanges}
                  disabled={!hasChanges || isApplying || isLoading}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    hasChanges && !isApplying && !isLoading
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isApplying ? 'Applying...' : 'Apply Changes'}
                </button>
                
                <button
                  onClick={resetColumns}
                  disabled={isLoading || isApplying}
                  className="text-gray-600 text-sm transition-all duration-200 hover:text-gray-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline mt-3"
                >
                  {isLoading ? 'Resetting...' : 'Reset to Default'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColumnReorderPopup;