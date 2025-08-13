export default function CounsellorOverview() {
    return (
        <div className="">
            <div className="flex gap-4">
                <div className="card bg-white shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="card-body pb-6 flex flex-row gap-4">
                        <div className="flex-1">
                            <div>
                                <i className="text-3xl text-success ri-thumb-up-fill relative -top-3"></i>
                            </div>
                            <div className="text-sm poppins text-gray-500">Follow ups for Today&apos;s Date</div>
                        </div>
                        <div className="flex justify-end items-center flex-1">
                            <div className="text-4xl text-success poppins font-medium">60</div>
                        </div>
                    </div>
                </div>
                <div className="card bg-white shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="card-body pb-6 flex flex-row gap-3">
                        <div className="flex-1">
                            <div>
                                <i className="text-3xl text-warning relative -top-3 ri-calendar-event-fill"></i>
                            </div>
                            <div className="text-sm poppins text-gray-500">Your Overdue<br />Followups</div>
                        </div>
                        <div className="flex justify-end items-center flex-1">
                            <div className="text-4xl text-warning poppins font-medium">10</div>
                        </div>
                    </div>
                </div>
                <div className="card bg-white shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="card-body pb-6 flex flex-row gap-3">
                        <div className="flex-1">
                            <div>
                                <i className="text-3xl text-blue-9 relative -top-3 ri-user-3-fill"></i>
                            </div>
                            <div className="text-sm poppins text-gray-500">New Leads Assigned</div>
                        </div>
                        <div className="flex justify-end items-center flex-1">
                            <div className="text-4xl text-blue-9 poppins font-medium">30</div>
                        </div>
                    </div>
                </div>
                <div className="card bg-white shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="card-body pb-6 flex flex-row gap-3">
                        <div className="flex-1">
                            <div>
                                <i className="text-3xl text-purple-9 relative -top-3 ri-mail-fill"></i>
                            </div>
                            <div className="text-sm poppins text-gray-500">New Enquiries of Today</div>
                        </div>
                        <div className="flex justify-end items-center flex-1">
                            <div className="text-4xl text-purple-9 poppins font-medium">80</div>
                        </div>
                    </div>
                </div>
                <div className="card bg-white shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="card-body pb-6 flex flex-row gap-3">
                        <div className="flex-1">
                            <div>
                                <i className="text-3xl text-pink-9 relative -top-3 ri-booklet-fill"></i>
                            </div>
                            <div className="text-sm poppins text-gray-500">Ticket Awaiting Resolution</div>
                        </div>
                        <div className="flex justify-end items-center flex-1">
                            <div className="text-4xl text-pink-9 poppins font-medium">11</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}