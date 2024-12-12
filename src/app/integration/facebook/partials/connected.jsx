import { useEffect, useState } from 'react';
import SubscriptionForm from '@/app/integration/facebook/partials/subscriptionForm';
import SubscriptionDelete from '@/app/integration/facebook/partials/subscriptionDelete';

export default function FacebookConnect({ token, user }) {

    const [isTableReady, setTableReady] = useState(false);
    const [subscribedFormData, setSubscribedFormData] = useState(null);
    const [subscribedForms, setSubscribedForms] = useState([]);
    const [formToDelete, setFormToDelete] = useState(null);

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

    const renderSubscriptionForm = (pageId = '', formId = '', formTableId = '', subscriptionId = '', course = '', location = '') => {

        if (pageId.length < 1) return setSubscribedFormData(null);

        //Get mapped fields of selected form if not new form
        let mappedFields = {};
        if (pageId < 1) {
            setSubscribedFormData({
                corporateId: user._id,
                pageId: parseInt(pageId),
                formId: parseInt(formId),
                mappedFields
            });

            return;
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
                'corporateId': user._id,
                'pageId': pageId,
                'formId': formId
            })
        };

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/getMappedFields`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                result.map((item) => mappedFields[item.form_field_key] = parseInt(item.cn_field_id));
            })
            .then(() => {
                setSubscribedFormData({
                    corporateId: user._id,
                    pageId: parseInt(pageId),
                    formId: parseInt(formId),
                    mappedFields,
                    subscriptionId,
                    formTableId,
                    course,
                    location
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const deleteSubscriptionPopup = (data = null) => {
        console.log('to-delete', data);
        setFormToDelete(data)
    }

    return (

        <div>
            <div className="w-full bg-blue-50 relative">
                <button onClick={() => renderSubscriptionForm(0)} className="absolute right-44 -top-[58px] btn btn-solid-primary rounded-full">
                    <i className="ri-add-fill text-xl border-none mr-1.5 -ml-2"></i>
                    <div>Subscribe a Form</div>
                </button>
            </div>

            {(subscribedFormData !== null) ? <SubscriptionForm pages={token.data} formInfo={subscribedFormData} closeBtn={renderSubscriptionForm} cnToken={user.cn_token} userId={user._id} refreshTable={loadSubscribedPages} /> : ''}
            {(formToDelete !== null) ? <SubscriptionDelete form={formToDelete} closeBtn={deleteSubscriptionPopup} cnToken={user.cn_token} refreshTable={loadSubscribedPages} /> : ''}
            <div className="flex w-full h-full">
                {(!isTableReady) ? <div>Loading Subscribed Forms! Please Wait!</div> :
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-7"></th>
                                <th>Lead Form</th>
                                <th>Page Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribedForms.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="flex gap-2 justify-center items-center">
                                            <div>
                                                <div className="dropdown">
                                                    <label tabIndex="0">
                                                        <i className="ri-more-2-fill text-lg cursor-pointer"></i>
                                                    </label>
                                                    <div className="dropdown-menu w-40 dropdown-menu-right bg-white">
                                                        <a onClick={() => renderSubscriptionForm(item.page_id, item.form_id, item.form_table_id, item.subscription_id, item.course ?? '', item.target_location ?? '')}
                                                            className="dropdown-item text-sm"
                                                        >
                                                            Edit
                                                        </a>
                                                        <a onClick={() => deleteSubscriptionPopup(item)}
                                                            className="dropdown-item text-sm text-rose-500 hover:bg-rose-100"
                                                        >
                                                            Unsubscribe
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
                                </tr>
                            ))}
                        </tbody>

                    </table>
                }
            </div>
        </div>
    );
}