export default function RaiseTicketFav() {
    return (
        <div className="absolute bottom-8 right-8 z-50 flex justify-center gap-0 items-center bg-blue-500 pt-2 pb-1.5 px-3 rounded-full group cursor-pointer shadow-2xl">
            <div className="pointer-events-none">
                <i className="ri-chat-1-fill text-xl text-white"></i>
            </div>
            <div className="hidden group-hover:block pointer-events-none">
                <div className="poppins text-base text-white pr-2 pl-2">Raise Ticket</div>
            </div>
        </div>
    )
}