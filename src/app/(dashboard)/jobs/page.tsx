import './style.css';
import type { Metadata } from "next";
import JobPostingsController from './controller';

export const metadata: Metadata = {
  title: "Job Posting | Leadstor",
};

export default function JobPosting() {
  return <JobPostingsController />;
}
