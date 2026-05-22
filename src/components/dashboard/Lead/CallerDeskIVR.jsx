'use client';

import React, { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';
import { User, getCurrentUserMobile } from '@/utility/TinyDB';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const INDIAN_MOBILE_REGEX = /^\+91[6-9]\d{9}$/;

const serviceConfigs = {
  knowlarity: { type: "knowlarity", name: "Knowlarity", logo: "/logos/knowlarity.webp" },
  voxbay: { type: "voxbay", name: "Voxbay", logo: "/logos/voxbay.webp" },
  smartTG: { type: "smartTG", name: "smartTG", logo: "/logos/smartflo.webp" },
  smartflo: { type: "smartflo", name: "Smartflo IVR [TTS]", logo: "/logos/smartflo.webp" },
  callerdesk: { type: "callerdesk", name: "CallerDesk", logo: "/logos/callerdesk.webp" },
  bonvoice: { type: "bonvoice", name: "Bonvoice", logo: "/logos/bonvoice.webp" },
};

export default function CallerDeskIVR({ candidate, agentNumber = '', onClose, onNoIvrFallback }) {
  const [clientNumber, setClientNumber]     = useState('');
  const [agentInput, setAgentInput]         = useState('');
  const [agentInputMode, setAgentInputMode] = useState('default');
  const [isLoading, setIsLoading]           = useState(false);
  const [ivrServices, setIvrServices]       = useState([]);
  const [selectedIvrService, setSelectedIvrService] = useState('');
  const [servicesLoading, setServicesLoading] = useState(true);
  const [currentUserMobile, setCurrentUserMobile] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [owner, setOwner] = useState([]);

  // ── New: error states ────────────────────────────────────────
  const [clientNumberError, setClientNumberError] = useState('');
  const [agentNumberError,  setAgentNumberError]  = useState('');

  const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim();

  const isAdmin = User?._id === -1 || User?.roles?.includes('Admin') || User?.roles?.includes('Super Admin');

  // ── Transfer related states ────────────────────────────────────────
  const [callId, setCallId] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | success | failed | transferring
  const [callStatusMessage, setCallStatusMessage] = useState('');
  const [agents, setAgents] = useState([]);             // list of possible transfer targets
  const [transferTo, setTransferTo] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

	const fetchAgents = async () => {
		try {
			const data = await xFetch({
			path: '/services/profile/getUsers',
			payload: {}
			});
			let agentList = [];

			// Handle both possible response shapes
			if (data && typeof data === 'object' && !Array.isArray(data)) {
			agentList = Object.entries(data).map(([id, name]) => ({
				id: id,
				name: name || 'Unknown',
				mobile: '',               // ← we don't have it yet
				formattedMobile: ''
			}));
			} else if (Array.isArray(data)) {
			// Case: already array (future-proof)
			agentList = data.map(user => ({
				id: user.id || user._id,
				name: user.name || 'Unknown',
				mobile: user.mobile || '',
				formattedMobile: convertToCallNumber(user.mobile || '')
			}));
			}

			setAgents(agentList);

			// Set default agent (current user) if possible
			if (User?._id) {
			const current = agentList.find(a => a.id === String(User._id));
			if (current && current.formattedMobile) {
				setAgentInput(current.formattedMobile);
				setCurrentUserMobile(current.formattedMobile);
			}
			}
		} catch (error) {
			console.error('Error fetching agents:', error);
			toast.error('Failed to load agent list for transfer');
		}
	};

  // Convert any mobile string → +91xxxxxxxxxx or empty
  const convertToCallNumber = (mobile) => {
    if (!mobile) return '';
    let digits = mobile.toString().trim().replace(/\D/g, '');

    if (digits.length === 10) {
      return '+91' + digits;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return '+91' + digits.slice(1);
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return '+' + digits;
    }
    if (digits.length === 13 && digits.startsWith('91')) {
      return '+' + digits;
    }
    // already +91xxxxxxxxxx
    if (digits.length === 13 && digits.startsWith('+91')) {
      return digits;
    }
    return ''; // invalid → we will show error
  };

  // ── Initialize numbers ───────────────────────────────────────
  useEffect(() => {
    // Client
    const clientRaw = candidate?.mobile || '';
    const clientFmt = convertToCallNumber(clientRaw);
    setClientNumber(clientFmt);

    // Agent
    let agentRaw = agentNumber || getCurrentUserMobile() || '';
    if (!agentRaw && isAdmin) {
      // optional: you could fetch from /getUsers here too
    }
    const agentFmt = convertToCallNumber(agentRaw);
    setAgentInput(agentFmt);
    setCurrentUserMobile(agentFmt);
  }, [candidate?.mobile, agentNumber, isAdmin]);

  // ── Load IVR services ────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setServicesLoading(true);
      try {
        const res = await xFetch({ path: '/services/invite/getIVRDetails', method: 'GET' });
        if (res.success && res.data) {
          const services = [];
          if (res.data.hasKnowlarityIntegration)   services.push(serviceConfigs.knowlarity);
          if (res.data.hasVoxbayIntegration)       services.push(serviceConfigs.voxbay);
          if (res.data.hasSmartTGIntegration)     services.push(serviceConfigs.smartTG);
          if (res.data.hasSmartfloIntegration)  services.push(serviceConfigs.smartflo);
          if (res.data.hasCallerDeskIntegration)   services.push(serviceConfigs.callerdesk);
          if (res.data.hasBonvoiceIntegration)   services.push(serviceConfigs.bonvoice);
          console.log('Available IVR services:', services);
          setIvrServices(services);
          if (services.length > 0) setSelectedIvrService(services[0].type);
          if (services.length === 0) {
            onClose?.();
            if (typeof onNoIvrFallback === 'function') {
              onNoIvrFallback();
            }
          }
        } else {
          // fallback ...
        }
      } catch (err) {
        console.error(err);
      } finally {
        setServicesLoading(false);
      }
    };
    loadData();
	fetchAgents();
  }, []);

  // Close agent dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAgentDropdownOpen && !event.target.closest('[data-agent-dropdown]')) {
        setIsAgentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAgentDropdownOpen]);

  const validatePhone = (value) => {
    if (!value) return "Mobile number is required";
    if (!INDIAN_MOBILE_REGEX.test(value)) {
      return "Please enter a valid 10-digit Indian mobile number starting with 6-9";
    }
    return "";
  };

  const handleCallNow = async () => {
    setClientNumberError('');
    setAgentNumberError('');
    setCallStatus('calling');
    setCallStatusMessage('Initiating call... Please wait.');

    const clientPhone = clientNumber.trim();
    const agentPhone = agentInput.trim();

    const cErr = validatePhone(clientPhone);
    const aErr = validatePhone(agentPhone);

    if (cErr || aErr) {
      setClientNumberError(cErr);
      setAgentNumberError(aErr);
	  setCallStatusMessage('Invalid phone number(s). Please correct and try again.');
      toast.error("Please fix the phone numbers");
      setCallStatus('idle');
      return;
    }

    if (!selectedIvrService) {
		setCallStatusMessage('Please select an IVR provider.');
      	toast.error("Select an IVR provider");
      	setCallStatus('idle');
      	return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append('customerNumber', clientPhone);
      payload.append('agentNumber', agentPhone);

      if (selectedIvrService === 'voxbay') {
        payload.append('agentExtNo', '100');
        payload.append('callerId', agentPhone);
      }

      const endpointMap = {
        knowlarity: '/services/invite/callKnowlarity',
        voxbay: '/services/invite/callVoxbay',
        smartflo: '/services/invite/callSmartflo',
        smartTG: '/services/invite/callSmartfloIVR',
        callerdesk: '/services/invite/callCallerDeskIVR',
        bonvoice: '/services/invite/callBonvoiceIVR',
      };

      const res = await xFetch({
        path: endpointMap[selectedIvrService] || '/services/invite/callCallerDeskIVR',
        method: 'POST',
        payload,
        isFormData: true,
      });
	  
		let isSuccess = false;
		let successMessage = '';
		let callIdFromResponse = null;
		let errorMessage = 'Failed to initiate call. Please try again.';

		// Knowlarity nested structure
		if (res?.success && typeof res.success === 'object') {
			isSuccess = res.success.status === 'success' || !!res.success.message;
			successMessage = res.success.message || 'Call successfully placed via Knowlarity';
			callIdFromResponse = res.success.call_id;
		}
		// Flat structure (most other providers)
		else if (res?.success === true || res?.message) {
			isSuccess = true;
			successMessage = res.message || 'Call initiated successfully';
		}
		// Error cases
		else if (res?.error) {
			errorMessage = res.error?.message || res.error || 'Call failed';
		} else if (res?.message && !isSuccess) {
			errorMessage = res.message;
		}

		if (isSuccess) {
			setCallStatus('success');
			setCallStatusMessage(successMessage || `Call connected successfully via ${serviceConfigs[selectedIvrService]?.name}`);

			toast.success(successMessage || 'Call placed successfully');

			// Save call_id only for knowlarity
			if (selectedIvrService === 'knowlarity' && callIdFromResponse) {
				setCallId(callIdFromResponse);
			}

		} else {
			setCallStatus('failed');
			setCallStatusMessage(errorMessage);
			toast.error(errorMessage);
		}

    } catch (err) {
	    console.error(err);
      setCallStatus('failed');
      setCallStatusMessage('Network error. Failed to connect.');
      toast.error('Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  	const handleTransfer = async () => {
		if (!transferTo) {
			toast.warn("Please select an agent to transfer to");
			return;
		}

		if (!INDIAN_MOBILE_REGEX.test(transferTo)) {
			toast.error("Invalid transfer number format");
			return;
		}

		// For smartflo we might not need callId – but check if we have it
		if (selectedIvrService === 'knowlarity' && !callId) {
			toast.error("No active call ID available for transfer");
			return;
		}

		setTransferLoading(true);
		setCallStatus('transferring');
    	setCallStatusMessage('Transferring call... Please wait.');

		try {
			let endpoint = '';
			let payload = {};

			if (selectedIvrService === 'knowlarity') {
			endpoint = '/services/invite/callTransferKnowlarity';
			payload = {
				call_id: callId,
				transfer_to: transferTo,
				customerNumber: clientNumber,
				agentNumber: agentInput,
			};
			} else if (selectedIvrService === 'smartflo') {
			endpoint = '/services/invite/callTransferSmartFloTTS';
			payload = {
				transferTo: transferTo,          
				agentNumber: agentInput,
				customerNumber: clientNumber,
			};
			} else {
			toast.error("Transfer not supported for this provider");
			return;
			}

			const res = await xFetch({
			path: endpoint,
			method: 'POST',
			payload,
			});

			console.log('Transfer response:', res);

			if (res.success || res.message) {
				setCallStatus('success');
				setCallStatusMessage('Call transferred successfully!');
				toast.success(res.message || "Call transferred successfully");
				setTimeout(() => onClose?.(), 2200);
			} else {
				setCallStatus('failed');
				const msg = res.error || res.message || "Transfer failed";
				setCallStatusMessage(msg);
				toast.error(msg);
			}
		} catch (err) {
			console.error(err);
			setCallStatus('failed');
			setCallStatusMessage('Transfer failed. Please try again.');
			toast.error("Transfer request failed");
		} finally {
			setTransferLoading(false);
		}
	};

	return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <ToastContainer position="bottom-right" autoClose={4000} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Initiate Call</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

		{/* Content */}
		<div className="p-6 space-y-6">
			{/* IVR Service Selection */}
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-2">IVR Provider</label>
				{servicesLoading ? (
				<div className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 flex items-center justify-center">
					<span className="text-gray-500">Loading services...</span>
				</div>
				) : ivrServices.length > 0 ? (
				<div className="relative">
					{/* Custom Dropdown Button */}
					<button
					type="button"
					onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
					disabled={isLoading}
					className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
					>
					<div className="flex items-center gap-2">
						{selectedIvrService && ivrServices.find(s => s.type === selectedIvrService) ? (
						<>
							<img 
							src={ivrServices.find(s => s.type === selectedIvrService).logo} 
							alt={ivrServices.find(s => s.type === selectedIvrService).name}
							className="w-4 h-4 object-contain"
							onError={(e) => {
								e.target.style.display = 'none';
							}}
							/>
							<span className="text-gray-900">
							{ivrServices.find(s => s.type === selectedIvrService).name}
							</span>
						</>
						) : (
						<span className="text-gray-500">Select IVR Provider</span>
						)}
					</div>
					<svg 
						className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
					</button>

					{/* Dropdown Options */}
					{isServiceDropdownOpen && (
					<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
						{ivrServices.map((service) => (
						<button
							key={service.type}
							type="button"
							onClick={() => {
							setSelectedIvrService(service.type);
							setIsServiceDropdownOpen(false);
							}}
							className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 focus:outline-none focus:bg-blue-50"
						>
							<img 
							src={service.logo} 
							alt={service.name}
							className="w-4 h-4 object-contain flex-shrink-0"
							onError={(e) => {
								e.target.style.display = 'none';
							}}
							/>
							<span className="text-gray-900">{service.name}</span>
							{selectedIvrService === service.type && (
							<svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							)}
						</button>
						))}
					</div>
					)}
				</div>
				) : (
				<div className="w-full h-9 px-3 py-2 border border-red-300 rounded text-sm bg-red-50 flex items-center justify-center">
					<span className="text-red-600">No IVR services available</span>
				</div>
				)}
			</div>

			{/* Participants */}
			<div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer Number {candidateName ? `(${candidateName})` : ''}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={clientNumber.startsWith('+91') ? clientNumber.slice(3) : clientNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0,10);
                    const newVal = digits ? '+91' + digits : '';
                    setClientNumber(newVal);
                    setClientNumberError(''); // clear error on type
                  }}
                  onBlur={() => setClientNumberError(validatePhone(clientNumber))}
                  placeholder="Enter 10-digit number"
                  className={`w-full pl-12 pr-4 py-2.5 border rounded-lg text-sm transition-colors
                    ${clientNumberError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                  disabled={isLoading}
                />
              </div>
              {clientNumberError && (
                <p className="mt-1.5 text-sm text-red-600">{clientNumberError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Agent Number {User?.name ? `(${User.name})` : ''}
              </label>
              
              {agents.length > 0 ? (
                <>
                  {/* Agent Dropdown Selector */}
                  <div className="relative" data-agent-dropdown>
                    <button
                      type="button"
                      onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                      disabled={isLoading || (isAdmin && agentInputMode === 'manual')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex items-center justify-between disabled:bg-gray-100"
                      data-agent-dropdown-toggle
                    >
                      	<span className="text-gray-900">
							{(() => {
								const agent = agentInput ? agents.find(a => a.formattedMobile === agentInput) : null;
								return agent ? `${agent.name} — ${agent.mobile || agent.formattedMobile}` : (agentInput || 'Select an agent...');
							})()}
						</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Options */}
                    {isAgentDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" data-agent-dropdown>
                        {agents.map((agent) => (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => {
                              setAgentInput(agent.formattedMobile);
                              setCurrentUserMobile(agent.formattedMobile);
                              setAgentNumberError('');
                              setIsAgentDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                              <span className="text-sm text-gray-600">{agent.mobile}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual input toggle for admin */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAgentInputMode(prev => prev === 'default' ? 'manual' : 'default');
                        if (agentInputMode === 'default') {
                          // Switching to manual - clear to allow input
                          setAgentInput('');
                        } else {
                          // Switching back to default - restore current user mobile
                          const currentUser = agents.find(a => a.id === User._id);
                          if (currentUser) {
                            setAgentInput(currentUser.formattedMobile);
                          }
                        }
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      disabled={isLoading}
                    >
                      {agentInputMode === 'default' ? 'Enter custom agent number' : 'Select from agents list'}
                    </button>
                  )}

                  {/* Manual input field */}
                  {isAdmin && agentInputMode === 'manual' && (
                    <div className="mt-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={agentInput.startsWith('+91') ? agentInput.slice(3) : agentInput}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0,10);
                            const newVal = digits ? '+91' + digits : '';
                            setAgentInput(newVal);
                            setAgentNumberError('');
                          }}
                          onBlur={() => setAgentNumberError(validatePhone(agentInput))}
                          placeholder="Enter 10-digit number"
                          className={`w-full pl-12 pr-4 py-2.5 border rounded-lg text-sm transition-colors
                            ${agentNumberError
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                          disabled={isLoading}
                        />
                      </div>
                      {agentNumberError && (
                        <p className="mt-1.5 text-sm text-red-600">{agentNumberError}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Fallback input when no agents loaded */
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={agentInput.startsWith('+91') ? agentInput.slice(3) : agentInput}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0,10);
                      const newVal = digits ? '+91' + digits : '';
                      setAgentInput(newVal);
                      setAgentNumberError('');
                    }}
                    onBlur={() => setAgentNumberError(validatePhone(agentInput))}
                    placeholder="Enter 10-digit number"
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-lg text-sm transition-colors
                      ${agentNumberError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                    disabled={isLoading || agentInputMode !== 'manual'}
                  />
                </div>
              )}
              
              {agentNumberError && (
                <p className="mt-1.5 text-sm text-red-600">{agentNumberError}</p>
              )}
            </div>
          </div>

		  {/* Call Status Message */}
          {callStatus !== 'idle' && (
            <div className={`p-4 rounded-lg text-center text-sm font-medium ${
              callStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              callStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {callStatusMessage}
            </div>
          )}

			{/* Call Button */}
			<button
            onClick={handleCallNow}
            disabled={isLoading || transferLoading || !selectedIvrService || callStatus === 'success'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                Initiating...
              </>
            ) : (
              'Initiate Call'
            )}
          </button>

          {/* Transfer Section - only for Knowlarity + Smartflo tata tele service after success */}
          {callStatus === 'success' && (selectedIvrService === 'knowlarity' || selectedIvrService == 'smartflo') && (
            <div className="mt-6 pt-3 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Call to Another Agent
              </label>

              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1"
                disabled={transferLoading}
              >
                <option value="">Select agent...</option>
                {agents.map((agent) => (
                  <option key={agent.formattedMobile} value={agent.formattedMobile}>
                    {agent.name} — {agent.formattedMobile}
                  </option>
                ))}
              </select>

              <button
                onClick={handleTransfer}
                disabled={transferLoading || !transferTo}
                className="mt-4 w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {transferLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                    Transferring...
                  </>
                ) : (
                  'Transfer Call'
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
