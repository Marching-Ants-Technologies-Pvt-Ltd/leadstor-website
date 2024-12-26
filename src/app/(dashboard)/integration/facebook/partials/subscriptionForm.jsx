import { useEffect, useState } from 'react';

export default function SubscriptionForm({ pages, closeBtn, formInfo, cnToken, userId, refreshTable }) {

    const [selectedPageToken, setSelectedPageToken] = useState('');
    const [selectedFormId, setSelectedFormId] = useState(0);
    const [fbForms, setFbForms] = useState([]);
    const [fbFormQuestions, setFbFormQuestions] = useState([]);
    const [lsFormFields, setLsFormFields] = useState([]);
    const [refreshCount, setRefreshCount] = useState(0);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${cnToken}`);

    const pullFormList = (pageIndex) => {

        if (pageIndex < 1) {
            console.log('Deselected');
            setFbForms([]);
            setFbFormQuestions([]);
            setRefreshCount(0);
            return;
        }

        // Get page from index
        const page = pages[(pageIndex - 1)];
        setSelectedPageToken(page.access_token);

        // Get forms of this page
        FB.api(`/${page.id}/leadgen_forms?access_token=${page.access_token}&limit=200`, function (response) {
            console.log('Form Data Pulled');
            setFbForms(response.data);
            formSelectionChange(formInfo.formId, page.access_token);
        });
    }

    const formSelectionChange = (id, accessToken = null) => {

        setSelectedFormId(id);
        if (id < 1) {
            setRefreshCount(0);
            return;
        }

        // Get form fields
        FB.api(`${id}?fields=id,name,questions&access_token=${selectedPageToken || accessToken}`, function (response) {
            // Fetch Leadstor + Facebook Mapping Fields
            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/conceptninjasFields`, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    setLsFormFields(Object.values(result));
                    console.log('Got Leadstor Fields');
                });

            //Update Form Fields
            setRefreshCount(1);
            setFbFormQuestions(response.questions);
        });

    }

    async function handleSubscriptionForm(event) {

        // On Button click & disable it till data get submitted
        event.preventDefault();
        const contactForm = event.target;
        const formData = new FormData(contactForm);
        const inputs = Object.fromEntries(formData);

        // Compose Payload
        const payload = formInfo.mappedFields;
        payload.formId = inputs['form_id'];
        payload.pageId = inputs['page_id'];
        payload.course = inputs['x_course'];
        payload.target_location = inputs['x_location'];
        payload.pageAccessToken = selectedPageToken;
        payload.corporateId = userId;

        console.log('Form Submitted', payload);

        if(formInfo.pageId > 0){
            payload.subscriptionId = formInfo.subscriptionId;
            payload.formTableId = formInfo.formTableId;
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify(payload)
        };

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/subscribeFBPage`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log('Wo hoo...');
                refreshTable();
                closeBtn();
            })
            .catch((error) => {
                console.error(error);
            });

    }

    useEffect(() => {

        console.log('Drawer', formInfo);
        if (formInfo.pageId > 0) {
            const index = pages.findIndex(item => parseInt(item.id) === formInfo.pageId);
            if (index >= 0) pullFormList((index + 1));
        }

    }, []);

    return (
        <form onSubmit={handleSubscriptionForm}>
            <input type="checkbox" id="drawer-right" className="drawer-toggle" defaultChecked />
            <label className="overlay"></label>
            <div className="drawer drawer-right max-w-lg cursor-default poppins px-3 shadow-xl">
                <div className="drawer-content">
                    <label onClick={() => closeBtn()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                    <h3 className="text-xl font-medium text-gray-700">Leads Form</h3>
                    <div className="breadcrumbs text-sm pl-0 mb-5">
                        <ul>
                            <li>Facebook</li>
                            <li>Subscribe</li>
                            <li>Lead-Form</li>
                        </ul>
                    </div>
                    <div className="text-base text-blue-500">Page<span className="text-rose-500 ml-1">*</span></div>
                    <select className="select rounded-md mt-2 w-full max-w-full"
                        name='page_id'
                        defaultValue={formInfo.pageId}
                        onChange={(e) => pullFormList(parseInt(e.target.selectedIndex))}
                    >
                        <option value="0">Choose a page</option>
                        {pages.map((item, index) => (
                            <option key={index} value={item.id}>{item.name}</option>
                        ))}
                    </select>

                    <div className="text-base text-blue-500 mt-5">Form<span className="text-rose-500 ml-1">*</span></div>
                    <select className="select rounded-md mt-2 w-full max-w-full"
                        name='form_id'
                        value={selectedFormId}
                        onChange={(e) => formSelectionChange(parseInt(e.target.value))}
                    >
                        <option value="0">Choose a form</option>
                        {fbForms.map((item, index) => (
                            <option key={index} value={item.id}>{item.name}</option>
                        ))}
                    </select>

                    <div className="text-base text-blue-500 mt-5">Filed Mapping<span className="text-rose-500 ml-1">*</span></div>
                    {(refreshCount > 0) ?
                        <div>
                            {fbFormQuestions.map((question, questionIndex) => (
                                <div
                                    key={`question-${questionIndex}`}
                                    className="flex bg-gray-100 p-2 rounded-md mt-2"
                                >
                                    <div className="flex-1 justify-start items-center flex pl-2">
                                        <div>{question.label}</div>
                                    </div>
                                    <div className="flex-1 justify-start items-center flex">
                                        <select className="select rounded-md w-full max-w-full"
                                            value={(formInfo.mappedFields[question.key] ?? 0)}
                                            onChange={(e) => {
                                                formInfo.mappedFields[question.key] = parseInt(e.target.value);
                                                let refreshCounter = refreshCount +1;
                                                setRefreshCount(refreshCounter);
                                            }}
                                        >
                                            <option value="0">Choose a field</option>
                                            {lsFormFields.map((field, fieldIndex) => (
                                                <option
                                                    key={`field-${fieldIndex}`}
                                                    value={fieldIndex + 1}
                                                >
                                                    {field}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}

                        </div>
                        : <div className="text-xs text-gray-600 text-center w-full bg-rose-50 mt-2 rounded-md p-4">Choose a Facebook form to map fields</div>
                    }
                    <div className="flex items-center gap-2 mt-5">
                        <div className="text-xs w-fit text-gray-400">Fields With Default Value</div>
                        <div className="divider flex-1 divider-horizontal w-full"></div>
                    </div>
                    <div className="text-base text-blue-500">Course</div>
                    <input name='x_course' defaultValue={formInfo.course??''} className="input rounded-md mt-2 w-full max-w-full" placeholder="" />
                    <div className="text-base text-blue-500 mt-5">Location</div>
                    <input name='x_location' defaultValue={formInfo.location??''} className="input rounded-md mt-2 w-full max-w-full" placeholder="" />

                    {(formInfo.pageId > 0)
                        ? <button type='submit' className="btn btn-primary rounded-md mt-10">Update Subscription</button>
                        : <button type='submit' className="btn btn-primary rounded-md mt-10">Subscribe</button>
                    }
                </div>
            </div>
        </form>
    );
}