'use client'

import { useEffect, useState, useRef } from 'react';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import DayPickerModal from '@/components/elements/DayPickerModel';
import JoineeInstallmentNotFound from './notFound';
import JoineePaymentAnalytics from './analytics';
import JoineeInstallments from './installments';
import JoineeInstallmentForm from './installmentForm';
import {
    SelectFieldTypeArray,
    SelectFieldTypeArrayOfObject,
    SelectFieldDefault,
    MultiSelectField
} from '@/components/elements/SelectField';

export default function JoineePaymentForm({ payment_id }) {

    const notesRef = useRef(null);
    const corporateId = Corporate?._id;
    const [highlight, setHighlight] = useState(false);
    const [candidate, setCandidate] = useState({});
    const [filterParams, setFilterParams] = useState({});
    const [currency, setCurrency] = useState({});
    const [currentCurrency, setCurrentCurrency] = useState('');
    const [datePicker, setDatePicker] = useState(false);
    const [currentInstallment, setCurrentInstallment] = useState(null);
    const [showInfo, setShowInfo] = useState(true)

    // Helper Functions
    const pad = (n) => String(n).padStart(2, "0");
    const formatDOJ = (input = '') => {

        if (input === '') return '';
        const date = new Date(input.replace(" ", "T"));

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const day = String(date.getDate()).padStart(2, "0");
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        const output = `${day}-${month}-${year}`;
        return output; // 26-January-2026

    }

    const decodeHtml = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    const profileImage = (image = '', name = '') => {
        if (image.length < 7) {
            if (name.length < 1) name = 'Candidate';
            name = name?.split(' ')[0];
            return `https://api.dicebear.com/9.x/initials/svg?size=200&seed=${name}`;
        }

        return image;
    }

    const onWhatsappButtonClick = () => {
        let mobile = candidate?.mobile ?? '';
        if (mobile.length < 5) return;

        window.open(`https://wa.me/${mobile}?text=hello`, '_blank');
    }

    const scrollToNotes = () => {
        notesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);
    };

    const onInfoChange = (key, value) => {
        console.log('Info Changed', key, value);

        if (key === 'batchId') {
            setCandidate(prev => ({
                ...prev,
                [key]: Array.isArray(value) ? value : [value]
            }));
            return;
        }

        setCandidate((prev) => ({
            ...prev,
            [key]: value
        }));

        //Update Currency Code On UI
        if (key === 'candidate_currency') {
            let cnc = currency?.[value] ?? {};
            setCurrentCurrency(decodeHtml(cnc?.currency_html_code ?? '?'));
        }
    }

    const handleKeyUp = (key, value) => {
        setCandidate((prev) => ({
            ...prev,
            [key]: value
        }));

        // Adjust Final Price
        if (['gst', 'discount'].includes(key)) setTimeout(handleCalculation, 300);
    };

    const handleCalculation = () => {
        setCandidate(prev => {
            const discount = parseInt(prev.discount ?? '0', 10);
            const baseFee = parseInt(prev.stdFee ?? '0', 10);
            const gst = parseInt(prev.gst ?? '0', 10);

            const discountedAmount = Math.max(baseFee - discount, 0);
            const gstAmount = gst >= 1 ? Math.round((discountedAmount * gst) / 100) : 0;
            const finalAmount = discountedAmount + gstAmount;

            console.log({ baseFee, discount, discountedAmount, gst, gstAmount, finalAmount });

            return {
                ...prev,
                agreedPayment: finalAmount
            };
        });
    };

    const deleteInstallment = (installments, key) => {
        if (!installments || typeof installments !== 'object') return installments;

        const { [key]: _, ...rest } = installments;
        return rest;
    };

    const handleDeleteInstallment = (count) => {
        setCandidate(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                installments: deleteInstallment(prev.installments, count),
            };
        });
    };

    const handleChangeInInstallment = (data) => {
        const fixed = {
            amount: `${data?.amount ?? '0'}`,
            date: data?.date ?? null,
            status: `${data?.status ?? '0'}`,
            refNum: `${data?.refNo ?? ''}`,
        };
        console.log('Installment Edited', data, fixed);

        setCandidate(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                installments: {
                    ...(prev.installments ?? {}),
                    [data.count]: {
                        ...(prev.installments?.[data.count] ?? {}),
                        ...fixed,
                    },
                },
            };
        });

    }

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            xFetch({
                path: '/services/joinees/getFilterParameters',
                payload: { corporateId: Corporate._id }
            }),
            xFetch({
                path: '/services/admin/getActiveCurrencyList',
                payload: { status: '1' }
            }),
            xFetch({
                path: '/services/joinees/getCandidateTrackingDetails',
                payload: { trackingId: payment_id }
            })
        ])
            .then(([filterParams, currencyList, candidateInfo]) => {
                if (!isMounted) return;
                setFilterParams(filterParams);
                setCurrency(currencyList);
                setCandidate(candidateInfo);

                // Set Current Currency
                let cnc = currencyList?.[candidateInfo?.candidate_currency ?? 'x'] ?? {};
                setCurrentCurrency(cnc?.currency_html_code ?? '?');
            })
            .catch(error => {
                console.error('Error loading initial data', error);
            });

        return () => {
            isMounted = false;
        };

    }, [corporateId, payment_id]);

    // Checks
    if (!candidate?.name) {
        if (candidate?.type && candidate.type === 'notFund') {
            return (
                <JoineeInstallmentNotFound id={payment_id} />
            )
        }
    }

    return (
        <div>
            <JoineePaymentAnalytics
                agreed={candidate?.agreedPayment ?? '0'}
                currency={decodeHtml(currentCurrency)}
                onChat={onWhatsappButtonClick}
                gotoNotes={scrollToNotes}
            />
            <DayPickerModal
                open={datePicker}
                onConfirm={(date) => {
                    let value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 00:00:00`;
                    console.log('New DOJ', date, value);
                    onInfoChange('doj', value);
                }}
                onClose={() => setDatePicker(false)}
                currentDate={candidate?.doj ?? ''}
            />

            <JoineeInstallmentForm
                data={currentInstallment}
                onClose={() => setCurrentInstallment(null)}
                onConfirm={handleChangeInInstallment}
            />

            {showInfo && (
                <div className='max-w-[1400px] mx-auto p-6'>
                    <div className='border border-blue-300 bg-blue-50 -mb-6 p-3 rounded-[10px] flex items-center gap-2 shadow-md'>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#4a90e2" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 9.62069C19 12.1999 17.7302 14.1852 15.7983 15.4917C15.3483 15.796 15.1233 15.9482 15.0122 16.1212C14.9012 16.2942 14.8633 16.5214 14.7876 16.9757L14.7287 17.3288C14.5957 18.127 14.5292 18.526 14.2494 18.763C13.9697 19 13.5651 19 12.7559 19H10.1444C9.33528 19 8.93069 19 8.65095 18.763C8.3712 18.526 8.30469 18.127 8.17166 17.3288L8.11281 16.9757C8.03734 16.5229 7.99961 16.2965 7.88968 16.1243C7.77976 15.9521 7.55428 15.798 7.10332 15.4897C5.1919 14.1832 4 12.1986 4 9.62069C4 5.4119 7.35786 2 11.5 2C12.0137 2 12.5153 2.05248 13 2.15244" />
                                <path d="M16.5 2L16.7579 2.69703C17.0961 3.61102 17.2652 4.06802 17.5986 4.40139C17.932 4.73477 18.389 4.90387 19.303 5.24208L20 5.5L19.303 5.75792C18.389 6.09613 17.932 6.26524 17.5986 6.59861C17.2652 6.93198 17.0961 7.38898 16.7579 8.30297L16.5 9L16.2421 8.30297C15.9039 7.38898 15.7348 6.93198 15.4014 6.59861C15.068 6.26524 14.611 6.09613 13.697 5.75792L13 5.5L13.697 5.24208C14.611 4.90387 15.068 4.73477 15.4014 4.40139C15.7348 4.06802 15.9039 3.61102 16.2421 2.69703L16.5 2Z" />
                                <path d="M13.5 19V20C13.5 20.9428 13.5 21.4142 13.2071 21.7071C12.9142 22 12.4428 22 11.5 22C10.5572 22 10.0858 22 9.79289 21.7071C9.5 21.4142 9.5 20.9428 9.5 20V19" />
                            </svg>
                        </div>
                        <div className='text-sm flex-1 text-gray-700 relative'>
                            Fields highlighted with <span className='font-semibold text-xl text-rose-500 absolute'>*</span>&nbsp;&nbsp;&nbsp;are mandatory, you must provide info for those fields.
                        </div>
                        <div
                            className='cursor-pointer text-gray-600'
                            onClick={() => setShowInfo(false)}
                        >
                            <svg className='pointer-events-none' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="inherit" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto p-6 flex justify-evenly items-start align-top gap-5">

                <div className="bg-white border border-gray-200 rounded-[10px] p-5 flex-1">

                    {/* Personal Info */}
                    <div className="">
                        <h3 className="text-sm font-semibold mb-3">
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                            <Field
                                cbOnChange={handleKeyUp}
                                label="Candidate Name"
                                value={candidate?.name || ''}
                                fieldName='name'
                                required={true}
                            />
                            <Field
                                cbOnChange={handleKeyUp}
                                label="Email"
                                value={candidate?.email || ''}
                                fieldName='email'
                                required={true}
                            />
                            <Field
                                cbOnChange={handleKeyUp}
                                label="Mobile"
                                value={candidate?.mobile || ''}
                                fieldName='mobile'
                                required={true}
                            />

                            <div className='relative cursor-pointer'>
                                <div
                                    onClick={() => setDatePicker(true)}
                                    className='absolute h-11 top-4 left-0 w-full flex justify-end align-middle items-center'
                                >
                                    <div className='mr-1.5'>📅</div>
                                </div>
                                <Field
                                    cbOnChange={handleKeyUp}
                                    label="Date Of Joining"
                                    value={formatDOJ(candidate?.doj || '')}
                                    fieldName='doj'
                                    required={true}
                                />
                            </div>

                            <SelectFieldTypeArray
                                label="Course / Program"
                                options={Object.values(filterParams?.labels || {})}
                                selected={candidate?.label || 'Not Selected'}
                                cbOnChange={onInfoChange}
                                fieldName='label'
                                required={true}
                            />

                            <MultiSelectField
                                label="Batch / Intake"
                                options={Object.entries(filterParams?.batchNames || {}).map(
                                    ([key, value]) => ({
                                        id: key,
                                        value: value
                                    })
                                )}
                                selected={candidate?.batchId ?? []}
                                cbOnChange={onInfoChange}
                                fieldName='batchId'
                            />

                            <Field
                                cbOnChange={handleKeyUp}
                                label="City"
                                value={candidate?.addressLine1 || ''}
                                fieldName='addressLine1'
                                required={true}
                            />
                            <Field
                                cbOnChange={handleKeyUp}
                                label="Current Address"
                                value={candidate?.addressLine2 || ''}
                                fieldName='addressLine2'
                                required={true}
                            />

                            <SelectFieldTypeArray
                                label="Source"
                                options={Object.values(filterParams?.source || {})}
                                selected={candidate?.source || ''}
                                cbOnChange={onInfoChange}
                                fieldName='source'
                                required={true}
                            />

                            <SelectFieldDefault
                                label="Status"
                                options={Object.entries(filterParams?.statuses || {}).map(
                                    ([key, value]) => ({
                                        id: key,
                                        value: value
                                    })
                                )}
                                selected={String(candidate?.admission_status_id ?? "")}
                                cbOnChange={onInfoChange}
                                fieldName='admission_status_id'
                                required={true}
                            />

                        </div>
                    </div>

                    {/* Parent or Guardian Info */}
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-3">
                            Parent or Guardian Info
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                            <Field
                                cbOnChange={handleKeyUp}
                                label="Name"
                                placeholder='Full Name'
                                value={candidate?.parentGuardianName?.replace('null', '') || ''}
                                fieldName='parentGuardianName'
                            />
                            <Field
                                cbOnChange={handleKeyUp}
                                label="Mobile"
                                placeholder='+91 98XXXXXX10'
                                value={candidate?.parentGuardianMobile?.replace('null', '') || ''}
                                fieldName='parentGuardianMobile'
                            />

                            {/* Remarks */}
                            <div className="col-span-2 relative">
                                <label className="block text-xs text-gray-500 mb-1 relative">
                                    Remarks / Notes
                                    <span className='text-red-500 font-semibold text-lg absolute ml-1 -mt-1'>*</span>
                                </label>
                                <input
                                    ref={notesRef}
                                    className={`w-full outline-none px-[10px] py-2 text-[13px] border ${(highlight) ? 'border-blue-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="Any special notes from finance or sales"
                                />
                                {(highlight) &&
                                    <div className='absolute w-full rounded-md -top-[62px] left-20 pointer-events-none animate-bounce'>
                                        <svg
                                            className='rotate-[-45deg] -scale-x-100'
                                            xmlns="http://www.w3.org/2000/svg"
                                            shapeRendering="geometricPrecision"
                                            textRendering="geometricPrecision"
                                            imageRendering="optimizeQuality"
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            viewBox="0 0 512 190.285"
                                            width="150px"
                                            color='#ccc'
                                            fill='#2563eb'
                                        >
                                            <path d="M512 62.269c-32.208 3.503-65.126 11.155-82.935 11.576-5.87.14-13.175-.651-5.825-3.929 17.743-7.915 39.85-13.415 61.461-14.291-4.787-1.077-9.548-2.473-15.993-4.683-42.916-14.717-91.165-23.694-138.308-23.756-39.015-.053-79.822 5.737-115.535 22.126 13.263 12.299 25.007 25.723 35.154 40.787 21.629 32.107 31.567 79.665-13.75 96.773-37.675 14.221-72.262-18.318-76.731-54.787-3.222-26.29 6.915-45.475 19.352-63.408 5.258-7.581 11.717-14.262 19.168-20.104C105.119-16.905 17.276 26.293 0 117.511 4.91 5.165 125.544-21.164 205.932 42.942c70.469-46.003 210.713-30.084 282.411 7.501-9.463-9.291-17.535-22.446-22.866-35.006-.79-1.859-4.569-8.993-4.29-12.878.102-1.443.766-2.442 2.348-2.553.903-.063 1.863.407 2.868 1.35 2.92 2.749 9.199 13.053 15.44 23.057C491.104 39.255 499.115 50.13 512 62.269zm-304.367-6.573c13.918 12.907 26.764 28.048 37.028 43.982 16.542 25.678 22.453 56.275-1.472 72.95-14.806 10.319-30.931 9.682-44.76 1.389-49.808-29.871-25.747-96.994 9.204-118.321z" />
                                        </svg>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="col-span-2 mt-6">
                        <h4 className="text-sm font-semibold mb-3">
                            Profile Picture
                        </h4>

                        <div className="flex items-center gap-5 p-4 border rounded-lg bg-gray-50">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src={profileImage(candidate?.image ?? '', candidate?.name ?? '')}
                                    alt="Profile"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?size=200&seed=Candidate`;
                                    }}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-white ring-2 ring-gray-200"
                                />

                                {/* Overlay badge */}
                                <span className="absolute bottom-0 right-0 bg-white border rounded-full p-1 pt-0 shadow">
                                    📷
                                </span>
                            </div>

                            {/* Upload area */}
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Upload new photo
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    JPG or PNG • Max size 2MB • Square images work best
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-[10px] p-5">
                        <h3 className="text-sm font-semibold mb-4">
                            Payment Calculation
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                            <SelectFieldTypeArrayOfObject
                                label="Currency"
                                options={Object.entries(currency || {}).map(
                                    ([key, value]) => ({
                                        id: key,
                                        value: `${value?.currency_name ?? '-'} (${decodeHtml(value?.currency_html_code ?? '')})`
                                    })
                                )}
                                selected={candidate?.candidate_currency ?? ''}
                                cbOnChange={onInfoChange}
                                fieldName='candidate_currency'
                            />

                            <InputGroup
                                label="Standard Fee"
                                prefix={decodeHtml(currentCurrency)}
                                value={candidate?.stdFee || '0'}
                                readOnly={true}
                                fieldName='stdFee'
                            />

                            <InputGroup
                                label="Discount"
                                prefix={decodeHtml(currentCurrency)}
                                type="number"
                                value={candidate?.discount || '0'}
                                helper={`Max Discount ${candidate?.maximumDiscount || 0}% (${decodeHtml(currentCurrency)}${candidate?.maximumDiscountedFees ?? '0'})`}
                                cbOnChange={handleKeyUp}
                                fieldName='discount'
                            />

                            <InputGroup
                                label="GST Rate (%)"
                                prefix="%"
                                type="number"
                                value={candidate?.gst || '0'}
                                helper="Percentage applied to calculate tax amount"
                                cbOnChange={handleKeyUp}
                                fieldName='gst'
                            />

                            <InputGroup
                                label="Total Agreed Payment"
                                prefix={decodeHtml(currentCurrency)}
                                value={candidate?.agreedPayment || '0'}
                                helper="Auto calculated from Standard Fee, Discount & GST"
                                readOnly={true}
                                fieldName='agreedPayment'
                                required={true}
                            />
                        </div>
                    </div>

                    <JoineeInstallments
                        currency={decodeHtml(currentCurrency)}
                        installments={candidate?.installments ?? {}}
                        onInstallmentEdit={setCurrentInstallment}
                        onInstallmentDelete={handleDeleteInstallment}
                    />
                </div>

            </div>
        </div>
    );
}

// Helper Components
function Field({ label, value, required = false, fieldName, type = "text", placeholder = "", cbOnChange = (e) => { } }) {
    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1 relative">
                {label}
                {required && <span className='text-red-500 font-semibold text-lg absolute ml-1 -mt-1'>*</span>}
            </label>
            <input
                name={fieldName}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => cbOnChange(fieldName, e.target.value)}
                className={`w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md focus:border-blue-500 outline-none`}
            />
        </div>
    );
}

function SelectField({ label, fieldName, required = false, options, selected = '', cbOnChange = (e) => { } }) {
    if (selected.length > 0 && !options.includes(selected)) options.push(selected);
    return (
        <div className='relative'>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && <span className='text-red-500 font-semibold text-lg absolute ml-1 -mt-1'>*</span>}
            </label>
            <select
                name={fieldName}
                onChange={(e) => cbOnChange(fieldName, e.target.value)}
                value={selected}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md select-wrapper">
                {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
            <div className='w-5 h-5 bg-white absolute bottom-2 right-1 flex justify-start items-center align-middle pointer-events-none'>
                <svg className='mt-0.5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#000" fill="none" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" />
                </svg>
            </div>
        </div>
    );
}

function SelectFieldValue({ label, fieldName, required = false, options, selected = '', cbOnChange = (e) => { } }) {

    return (
        <div className='relative'>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && <span className='text-red-500 font-semibold text-lg absolute ml-1 -mt-1'>*</span>}
            </label>
            <select
                name={fieldName}
                onChange={(e) => cbOnChange(fieldName, e.target.value)}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md select-wrapper"
                value={selected}>
                <option value="">Select {label}</option>
                {options.map(o => (
                    <option key={o.id} value={o.id}>{o.value}</option>
                ))}
            </select>

            <div className='w-5 h-5 bg-white absolute bottom-2 right-1 flex justify-start items-center align-middle pointer-events-none'>
                <svg className='mt-0.5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#000" fill="none" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" />
                </svg>
            </div>
        </div>
    );

}

function InputGroup({ label, fieldName, required = false, readOnly = false, prefix, value, type = "text", helper, cbOnChange = (e) => { } }) {
    return (
        <div className='relative'>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && <span className='text-red-500 font-semibold text-lg absolute ml-1 -mt-1'>*</span>}
            </label>
            <div className="relative">
                <span className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center bg-gray-100 border border-r-0 rounded-l-md font-semibold text-gray-700">
                    {prefix}
                </span>

                {readOnly ? (
                    <input
                        name={fieldName}
                        type={type}
                        value={value}
                        readOnly
                        className="w-full pointer-events-none cursor-default pl-[52px] pr-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                    />
                ) : (
                    <input
                        name={fieldName}
                        type={type}
                        value={value}
                        onChange={(e) => cbOnChange(fieldName, e.target.value)}
                        className="w-full pl-[52px] pr-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-900 outline-none"
                    />
                )}
            </div>

            {helper && (
                <span className="block mt-1 text-xs text-gray-500 leading-snug">
                    {helper}
                </span>
            )}
        </div>
    );
}
