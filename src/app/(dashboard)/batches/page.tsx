import './style.css';
import type { Metadata } from "next";
import BatchesTabs from './Tabs';

export const metadata: Metadata = {
  title: "Batches | Leadstor",
};

export default function Batches() {
  return <BatchesTabs />;
}
