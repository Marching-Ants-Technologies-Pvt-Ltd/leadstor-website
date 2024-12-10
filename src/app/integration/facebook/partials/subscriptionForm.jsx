export default function SubscriptionForm({ pages }) {

    return (
        <div>
            <input type="checkbox" id="drawer-right" class="drawer-toggle" checked />
            <div class="drawer drawer-right max-w-96 cursor-default poppins pl-3">
                <div class="drawer-content">
                    <label for="drawer-right" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                    <h3 className="text-xl font-medium text-gray-700">Leads Form</h3>
                    <div className="breadcrumbs text-sm pl-0 mb-5">
                        <ul>
                            <li>Facebook</li>
                            <li>Subscribe</li>
                            <li>Lead-Form</li>
                        </ul>
                    </div>
                    <div className="text-base text-blue-500">Facebook Page</div>
                    <select className="select rounded-md mt-2">
                        <option value="-1">Choose a page</option>
                        {pages.map((item, index) => (
                            <option value={index}>{item.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}