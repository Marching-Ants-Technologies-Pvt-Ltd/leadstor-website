import Image from 'next/image'

export default function PeopleCard({ 
    image, name, role, message, 
    linked_in = "#",
    instagram = "#",
    twitter = "#"
}) {
    return (
        <div className="sm:flex gap-8 pb-8 border-b-2 mb-8 people-card">
            <div className="flex-none">
                <Image
                    className="rounded-full w-20 md:w-auto sm:w-32"
                    placeholder='empty'
                    src={image}
                    width={155}
                    height={155}
                    alt="Leadstor - People"
                    priority={false}
                />
            </div>
            <div className="grow">
                <h3 className="text-2xl mt-4 sm:mt-2 font-semibold poppins text-gray-800">{name}</h3>
                <h4 className="text-lg font-normal poppins text-gray-600">{role}</h4>
                <p className="my-4 text-gray-500 text-justify text-base">{message}</p>
                <div className="flex gap-3">
                    <a href={linked_in} target="_blank" className="h-8 w-8 mt-4 border border-gray-500 rounded-lg flex justify-center align-middle">
                        <Image
                            placeholder='empty'
                            src="/icons/footer-icon-2.svg"
                            width={14}
                            height={14}
                            alt="Leadstor Footer Icon"
                            priority
                        />
                    </a>
                    <a href={twitter} target="_blank" className="h-8 w-8 mt-4 border border-gray-800 rounded-lg flex justify-center align-middle">
                        <Image
                            placeholder='empty'
                            src="/icons/footer-icon-4.svg"
                            width={14}
                            height={14}
                            alt="Leadstor Footer Icon"
                            priority
                        />
                    </a>
                    <a href={instagram} target="_blank" className="h-8 w-8 mt-4 border border-gray-800 rounded-lg flex justify-center align-middle">
                        <Image
                            placeholder='empty'
                            src="/icons/footer-icon-3.svg"
                            width={16}
                            height={16}
                            alt="Leadstor Footer Icon"
                            priority
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}