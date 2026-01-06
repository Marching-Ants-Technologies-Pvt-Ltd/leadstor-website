// import './style.css';
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Leadstor | Edit Payment Details",
};

export default function CreatePaymentDetails({ params, }: {
    params: { payment_id: string };
}) {

    const paymentId = Number(params.payment_id);
    if (!Number.isInteger(paymentId) || paymentId !== 0 ) {
        redirect("/payments");
    }

    return (
        <div>
            <h3>Payment - Create New Payment Details</h3>
            <p>This page is currently under construction.</p>
        </div>
    );
}
