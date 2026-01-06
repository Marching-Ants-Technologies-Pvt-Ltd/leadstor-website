import './style.css';
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import JoineePaymentAnalytics from './analytics';
import JoineePaymentForm from './form';

export const metadata: Metadata = {
    title: "Leadstor | Edit Payment Details",
};

export default function EditPaymentDetails({ params, }: {
    params: { payment_id: string };
}) {

    const paymentId = Number(params.payment_id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        redirect("/payments");
    }

    return (
        <div className='overflow-y-auto'>
            <JoineePaymentAnalytics payment_id={paymentId} />
            <JoineePaymentForm payment_id={paymentId} />
        </div>
    );
}