import { useRouter } from 'next/navigation';

export default function JoineeInstallmentNotFound({ id }) {
    const router = useRouter();

    return (
        <div 
            style={{
                height: 'calc(100vh - 60px)'
            }}
            className="w-full flex justify-center items-center">
            <div className="w-[400px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="52" height="52" color="#374151" fill="none" stroke="#374151" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 8.5C14.5 5.73858 12.2614 3.5 9.5 3.5C6.73858 3.5 4.5 5.73858 4.5 8.5C4.5 11.2614 6.73858 13.5 9.5 13.5C12.2614 13.5 14.5 11.2614 14.5 8.5Z" />
                    <path d="M16.5 20.5C16.5 16.634 13.366 13.5 9.5 13.5C5.63401 13.5 2.5 16.634 2.5 20.5" />
                    <path d="M17.5 9.84615C17.5 8.82655 18.3954 8 19.5 8C20.6046 8 21.5 8.82655 21.5 9.84615C21.5 10.2137 21.3837 10.5561 21.1831 10.8438C20.5854 11.7012 19.5 12.0189 19.5 13.0385V13.5M19.4902 16H19.4992" />
                </svg>
                <h2 className="font-semibold text-xl text-gray-700 my-2">Candidate Not Found</h2>
                <p className="text-base text-gray-600">Looks like the candidate <span className="text-blue-500 font-semibold">#{id}</span> you are looking for is not present in your candidates record. Please check the candidate id and try again! For more Query You can contact Our Support team.</p>
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/payments')}
                        className="flex justify-center gap-2 align-middle font-semibold bg-blue-500 text-white rounded-md px-4 pb-1.5 pt-2">
                        <div className="rotate-[-180deg] pointer-events-none text-base relative">⮞</div>
                        <div className="pointer-events-none text-sm">Back to payments</div>
                    </button>
                </div>
            </div>
        </div>
    )
}