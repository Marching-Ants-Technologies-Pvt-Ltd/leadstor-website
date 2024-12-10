import { useEffect, useState } from 'react';
import SubscriptionForm from '@/app/integration/facebook/partials/subscriptionForm';

export default function FacebookConnect({ token, user }) {

    const [isTableReady, setTableReady] = useState(false);
    const [subscribedForms, setSubscribedForms] = useState([]);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.cn_token}`);

    const loadSubscribedPages = () => {
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
                'corporateId': user._id,
                'pages': token.data
            })
        };

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/getSubscribedForms`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                setSubscribedForms(result);
                setTableReady(true);
            })
            .catch((error) => {
                console.error(error);
                setTableReady(false);
            });
    }

    useEffect(() => {

        console.log('Loading Subscribed Forms', token);
        loadSubscribedPages();


    }, []);

    return (

        <div>
            <div className="w-full bg-blue-50 hidden">
                <p className="poppins text-sm text-center text-gray-600 py-4">Your <strong>Facebook</strong> pages are connected &amp; the access token is valid till 26 November 2024 11:45 PM. <span className="underline hover:text-blue-500 cursor-pointer">Click here</span> to disconnect or refresh the token!</p>
            </div>

            <SubscriptionForm pages={token.data} />

            <div className="flex w-full overflow-x-auto">
                {(!isTableReady) ? <div>Loading Subscribed Forms! Please Wait!</div> :
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-7">
                                    {/* <input type="checkbox" className="checkbox checkbox-solid" /> */}
                                    <button className="btn btn-solid-primary btn-circle">
                                        <i className="ri-add-fill text-xl border-none"></i>
                                    </button>
                                </th>
                                <th>Lead Form</th>
                                <th>Page Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribedForms.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="flex gap-2 justify-center items-center">
                                            {/* <input type="checkbox" className="checkbox checkbox-solid" /> */}
                                            <div>
                                                <div className="dropdown">
                                                    <label tabIndex="0">
                                                        <i className="ri-more-2-fill text-lg cursor-pointer"></i>
                                                    </label>
                                                    <div className="dropdown-menu w-40 dropdown-menu-right bg-white">
                                                        <a className="dropdown-item text-sm">Edit</a>
                                                        <a
                                                            tabIndex="-1"
                                                            className="dropdown-item text-sm text-rose-500 hover:bg-rose-100"
                                                        >
                                                            Delete
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col poppins text-sm font-normal">
                                            <div className="text-gray-800">{item.form_name}</div>
                                            <div className="text-gray-500">{item.form_id}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col poppins text-sm font-normal">
                                            <div className="text-gray-800">{item.page_name}</div>
                                            <div className="text-gray-500">{item.page_id}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-flat-success">
                                            Connected
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                }
            </div>
        </div>
    );
}