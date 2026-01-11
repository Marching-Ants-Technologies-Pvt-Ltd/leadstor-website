import './style.css';
import type { Metadata } from "next";
import PaymentsSectionController from './controller';

export const metadata: Metadata = {
    title: "Payments | Leadstor",
};

export default function Payments() {

    return (
        <PaymentsSectionController />
    );
}