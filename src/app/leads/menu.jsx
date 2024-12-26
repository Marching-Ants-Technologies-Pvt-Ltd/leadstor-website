export default function LeadsMenu() {
    return (
        <div className="grow flex justify-end align-middle poppins gap-1 text-gray-600">

            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                <i class="ri-user-add-line text-xl"></i>
                <div className='mr-1'>Lead</div>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-text-block text-lg mt-1"></i>
                        <span className='text-sm'>Add Manually</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-upload-cloud-2-line text-lg mt-1"></i>
                        <span className='text-sm'>Import enquiries</span>
                    </a>
                </div>
            </div>

            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                <i class="ri-file-excel-2-fill text-xl"></i>
                <div className='mr-1'>Report</div>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-calendar-event-line text-lg mt-1"></i>
                        <span className='text-sm'>Daily report</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-download-cloud-2-line text-lg mt-1"></i>
                        <span className='text-sm'>Export enquiries</span>
                    </a>
                </div>
            </div>

            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-5'>
                <i class="ri-filter-2-line text-xl"></i>
                <div className='mr-1'>Filter</div>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-user-follow-line text-lg mt-1"></i>
                        <span className='text-sm'>Followups</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-bookmark-line text-lg mt-1"></i>
                        <span className='text-sm'>Bookmarks</span>
                    </a>
                    <div class="dropdown-divider my-1" role="separator"></div>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-equalizer-3-line text-lg mt-1"></i>
                        <span className='text-sm'>Advance</span>
                    </a>
                </div>
            </div>

            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-0'>
                <i class="ri-shapes-line text-xl"></i>
                <div className='mr-1'>Actions</div>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-chat-1-line text-lg mt-1"></i>
                        <span className='text-sm'>Send SMS</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-mail-ai-line text-lg mt-1"></i>
                        <span className='text-sm'>Send Email</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i class="ri-user-voice-line text-lg"></i>
                        <span className='text-sm'>Invite Again</span>
                    </a>
                    <div class="dropdown-divider my-1" role="separator"></div>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 hover:bg-rose-100 text-rose-500">
                        <i class="ri-delete-bin-7-line text-lg"></i>
                        <span className='text-sm'>Delete Invite</span>
                    </a>
                </div>
            </div>

            <div className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10 ml-5'>
                <i class="ri-pie-chart-line text-xl"></i>
            </div>
            <div className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10'>
                <i class="ri-refresh-line text-xl"></i>
            </div>
        </div>
    );
}