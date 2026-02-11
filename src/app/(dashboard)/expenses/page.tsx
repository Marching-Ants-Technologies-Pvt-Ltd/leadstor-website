import './style.css';
import type { Metadata } from "next";
import ExpensesTabs from './Tabs';

export const metadata: Metadata = {
  title: "Expenses | Leadstor",
};

export default function Expenses() {
  return <ExpensesTabs />;
}
