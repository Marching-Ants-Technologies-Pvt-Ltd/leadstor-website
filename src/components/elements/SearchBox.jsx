export default function SearchBox() {
    return (
        <div  className="border rounded-md h-full flex px-3 gap-2 max-w-80">
            <div className="flex justify-center items-center border-r pr-3">
                <i className="ri-search-line text-xl text-gray-600"></i>
            </div>
            <input type="text" placeholder="Search by name/email . . ." className="w-full text-base bg-transparent outline-none" />
        </div>
    )
}