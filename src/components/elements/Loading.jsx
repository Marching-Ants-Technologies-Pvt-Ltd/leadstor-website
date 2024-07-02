import Image from "next/image";

export default function Loading() {
    return (
        <div>
            <div className="flex justify-center items-center h-screen">
                <div className="rounded-full h-20 w-20 bg-blue-800 animate-ping"></div>
            </div>
        </div>
    );
}