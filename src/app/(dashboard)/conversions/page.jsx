import ConversionMenu from './menu';
import ConversionPagination from './pagination';
import ConversionTable from './table';

export default function Leads() {

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            <ConversionMenu />
            <ConversionTable />
            <ConversionPagination />
        </div>
    );
}