import CounsellorOverview from '@/app/dashboard/partials/CounsellorOverview';

export default function Dashboard() {

    const isAdmin = false;

    if (!isAdmin) return <CounsellorOverview />

    return (
        <div className="w-full h-full">
            Admin Overview - ToDo
        </div>
    );
}