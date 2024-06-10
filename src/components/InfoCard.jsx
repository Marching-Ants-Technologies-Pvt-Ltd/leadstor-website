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
                <div className="font-semibold text-sm text-[#0b1320] my-3">{label}</div>
                <div className='text-base font-normal leading-6 text-[#3b3f47]'>{description}</div>
            </div>
        </>
    );
}