import Image from 'next/image';
import WhatsappService from '@/components/integration/WhatsAppConnect';

export default function WhatsappIntegration() {
    return (
        <div className="w-full h-full bg-white rounded-md shadow-md">
            <div className="flex border-b py-4 px-7 gap-4">
                <div className='flex-grow-0'>
                    <Image
                        className='rounded-md pointer-events-none'
                        placeholder='empty'
                        src='/icons/services/whatsapp/icon.png'
                        width={45}
                        height={45}
                        alt="WhatsApp Icon"
                        priority={false}
                    />
                </div>
                <div className="flex-1 flex justify-start items-center section-info">
                    <div>
                        <h2 className="text-gray-700 poppins text-2xl font-semibold">WhatsApp Integration</h2>
                    </div>
                </div>
                <div className="">
                    <button>Automation</button>
                </div>
            </div>
            <div className='w-full px-6 py-8'>
                <p className="text-sm text-center poppins text-gray-500 mt-0">We offer multiple WhatsApp API aggregators for you to choose from. Alternatively, if you&apos;re registered with an existing WhatsApp service provider, you can integrate that service manually.</p>
            </div>
            <div className="flex flex-col gap-3 px-6 pb-6">
                <WhatsappService icon='/icons/leadstor.png' label='Leadstor' summary='Use our default whatsapp API to send out whatsapp messages to your leads.' isConnected={true} />

                <WhatsappService icon='/icons/services/whatsapp/kaleyra.png' label='Kaleyra' summary='Trusted Omni channel Communication Platform & CPaas Solution for Businesses' isConnected={false} />

                <WhatsappService icon='/icons/services/whatsapp/gupshup.png' label='Gupshup' summary='Best WhatsApp Business API & Chatbot - Gupshup' isConnected={false} />

                <WhatsappService icon='/icons/services/whatsapp/wati.webp' label='Wati' summary='Business Messaging Made Simple on Your Favorite App!' isConnected={false} />

                <WhatsappService icon='/icons/services/whatsapp/sinch.png' label='Sinch' summary='Enterprise Communications Platform | WhatsApp Business Service Provider' isConnected={false} />
            </div>
        </div>
    );
}