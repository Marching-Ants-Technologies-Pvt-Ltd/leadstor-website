import Image from 'next/image';

export default function WhatsappService({
    icon = '/icons/leadstor.png',
    label = '',
    summary = '',
    isConnected = false
}) {

    return (
        <div className="border border-gray-300 p-4 rounded-lg w-full cursor-pointer">
            <div className="flex items-center flex-row poppins gap-4">
                <Image
                    className='rounded-md pointer-events-none'
                    placeholder='empty'
                    src={icon}
                    width={42}
                    height={42}
                    alt="User Avatar"
                    priority={false}
                />
                <div className='flex-1 pointer-events-none'>
                    <h3 className='font-medium text-gray-700 text-xl'>{label}</h3>
                    <p className='text-sm text-justify text-gray-500'>{summary}</p>
                </div>
                {isConnected ? (
                    <div className='bg-green-100 py-1 border border-green-500 px-2 rounded-md text-green-700 cursor-pointer flex justify-center items-center flex-row'>
                        <i className="ri-checkbox-circle-fill text-lg mr-1 pointer-events-none"></i>
                        <a className='mr-0.5 text-sm pointer-events-none'>Connected</a>
                    </div>
                ) : (
                    <div className='bg-gray-100 py-1 border px-2 rounded-md text-gray-700  cursor-pointer flex justify-center items-center flex-row hover:shadow-md'>
                        <i className="ri-plug-fill mr-1  text-lg pointer-events-none"></i>
                        <a className='mr-0.5 text-sm pointer-events-none'>Connect</a>
                    </div>)
                }
            </div>
        </div>
    )
}