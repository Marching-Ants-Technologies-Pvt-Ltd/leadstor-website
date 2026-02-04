import type { Metadata } from "next";
import InvoicesSectionController from "./controller";

export const metadata: Metadata = {
  title: "Invoices | Leadstor",
};

export default function InvoicesPage() {
  return <InvoicesSectionController />;
}