
import type { Metadata } from "next";
import JoineePaymentForm from './form';

export const metadata: Metadata = {
    title: "Leadstor | Payment Details",
};

export default function EditPaymentDetails({ params, }: {
    params: { payment_id: string };
}) {

    let paymentId = Number(params.payment_id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        paymentId = 0;
    }

    return (
        <div className='overflow-y-auto'>
            <JoineePaymentForm payment_id={paymentId} />
        </div>
    );
}