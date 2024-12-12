import { useEffect, useState } from 'react';

export default function SubscriptionForm({ form, closeBtn, cnToken, refreshTable }) {

    const handelFormDelete = () => {
        console.log('Deleting', form);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${cnToken}`);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
                'form_table_id': form.form_table_id
            })
        };

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/deleteSubscribeForm`, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log('Form Unsubscribed', result);
                refreshTable();
                closeBtn();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div>
            <input className="modal-state" type="checkbox" defaultChecked />
            <div className="modal">
                <label className="modal-overlay"></label>
                <div className="modal-content flex flex-col gap-5 poppins">
                    <label onClick={() => closeBtn()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                    <h2 className="text-xl text-gray-800">Unsubscribe from this Form?</h2>
                    <span className='text-gray-600'>Are you sure you want to unsubscribe from the form <strong className='font-semibold'>{form.form_name}</strong>, which is associated with the <strong className='font-semibold'>{form.page_name}</strong> page? Please confirm your action.</span>
                    <div className="flex justify-end">
                        <button onClick={handelFormDelete} className="btn btn-error btn-block">Yes, Unsubscribe</button>
                    </div>
                </div>
            </div>
        </div>
    );
}