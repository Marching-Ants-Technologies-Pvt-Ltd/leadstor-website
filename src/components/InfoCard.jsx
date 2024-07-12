import Image from 'next/image'
import { describe } from 'node:test';

export default function InfoCard({ icon, label, description }) {
    return (
        <>
            <div>
                <Image
                    src={icon}
                    width={36}
                    height={36}
                    alt={label}
                />
                <div className="font-semibold text-sm text-gray-700 my-3">{label}</div>
                <div className='text-sm sm:text-base text-justify font-normal leading-6 text-gray-600'>{description}</div>
            </div>
        </>
    );
}