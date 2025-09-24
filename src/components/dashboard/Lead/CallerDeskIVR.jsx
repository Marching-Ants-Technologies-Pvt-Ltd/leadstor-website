'use client';

import React, { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';
import { User, getCurrentUserMobile } from '@/utility/TinyDB';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const serviceConfigs = {
  knowlarity: { type: "knowlarity", name: "Knowlarity", logo: "/logos/knowlarity.webp" },
  voxbay: { type: "voxbay", name: "Voxbay", logo: "/logos/voxbay.webp" },
  smartflo: { type: "smartflo", name: "Smartflo", logo: "/logos/smartflo.webp" },
  smartflo_ivr: { type: "smartflo_ivr", name: "Smartflo IVR", logo: "/logos/smartflo.webp" },
  callerdesk: { type: "callerdesk", name: "CallerDesk", logo: "/logos/callerdesk.webp" },
};

export default function CallerDeskIVR({ candidate, agentNumber = '', onClose }) {
	const [clientNumber, setClientNumber] = useState(candidate?.mobile || '');
	const [agentInput, setAgentInput] = useState(String(agentNumber || getCurrentUserMobile() || ''));
	const [agentInputMode, setAgentInputMode] = useState('default'); // 'default', 'manual'
	const [isLoading, setIsLoading] = useState(false);
	const [ivrServices, setIvrServices] = useState([]);
	const [selectedIvrService, setSelectedIvrService] = useState('');
	const [servicesLoading, setServicesLoading] = useState(true);
	const [currentUserMobile, setCurrentUserMobile] = useState(agentNumber || getCurrentUserMobile());
	const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
	const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim();
	
	// Check if user is admin
	const isAdmin = User?._id === -1 || User?.roles?.includes('Admin') || User?.roles?.includes('Super Admin');

	// Development flag - set to false for production
	const SHOW_ALL_SERVICES_FOR_TESTING = true;

	// Load available IVR services
	useEffect(() => {
		const loadData = async () => {
		setServicesLoading(true);
		
		try {
			// Load only IVR services (mobile is now available via TinyDB)
			const servicesResponse = await xFetch({
			path: '/services/invite/getIVRDetails',
			method: 'GET'
			});
			
			// Set initial agent input from TinyDB mobile if no agentNumber provided
			if (!agentNumber) {
			const userMobile = getCurrentUserMobile();
			if (userMobile) {
				setAgentInput(userMobile);
				setCurrentUserMobile(userMobile);
			}
			}
			
			// Handle IVR services
			if (servicesResponse.success && servicesResponse.data) {
			const services = [];
			
			if (servicesResponse.data.hasKnowlarityIntegration) {
			services.push(serviceConfigs.knowlarity);
			}
			if (servicesResponse.data.hasVoxbayIntegration) {
			services.push(serviceConfigs.voxbay);
			}
			if (servicesResponse.data.hasSmartfloIntegration) {
			services.push(serviceConfigs.smartflo);
			}
			if (servicesResponse.data.hasSmartfloIVRIntegration) {
			services.push(serviceConfigs.smartflo_ivr);
			}
			if (servicesResponse.data.hasCallerDeskIntegration) {
			services.push(serviceConfigs.callerdesk);
			}
			
			setIvrServices(services);

			if (services.length > 0) {
				setSelectedIvrService(services[0].type);
			} else {
				// If no services are configured, show all for testing
				const fallbackServices = [
				{ type: 'knowlarity', name: 'Knowlarity', logo: '/logos/knowlarity.webp' },
				{ type: 'voxbay', name: 'Voxbay', logo: '/logos/voxbay.webp' },
				{ type: 'smartflo', name: 'Smartflo', logo: '/logos/smartflo.webp' },
				{ type: 'smartflo_ivr', name: 'Smartflo IVR', logo: '/logos/smartflo.webp' },
				{ type: 'callerdesk', name: 'CallerDesk', logo: '/logos/callerdesk.webp' }
				];
				console.log('No services configured, using fallback:', fallbackServices);
				setIvrServices(fallbackServices);
				setSelectedIvrService(fallbackServices[0].type);
				toast.warn('No IVR services are configured - showing all services for testing');
			}
			} else {
			console.error('Backend response failed:', servicesResponse);
			// Fallback: show all services for testing
			const fallbackServices = [
				{ type: 'knowlarity', name: 'Knowlarity', logo: '/logos/knowlarity.webp' },
				{ type: 'voxbay', name: 'Voxbay', logo: '/logos/voxbay.webp' },
				{ type: 'smartflo', name: 'Smartflo', logo: '/logos/smartflo.webp' },
				{ type: 'smartflo_ivr', name: 'Smartflo IVR', logo: '/logos/smartflo.webp' },
				{ type: 'callerdesk', name: 'CallerDesk', logo: '/logos/callerdesk.webp' }
			];
			console.log('Using fallback services:', fallbackServices);
			setIvrServices(fallbackServices);
			setSelectedIvrService(fallbackServices[0].type);
			toast.error('Failed to load IVR services - using fallback services');
			}
		} catch (err) {
			console.error('Error loading data:', err);
			toast.error('Failed to load IVR services');
			// Fallback services on error
			const fallbackServices = [
			{ type: 'knowlarity', name: 'Knowlarity', logo: '/logos/knowlarity.webp' },
			{ type: 'voxbay', name: 'Voxbay', logo: '/logos/voxbay.webp' },
			{ type: 'smartflo', name: 'Smartflo', logo: '/logos/smartflo.webp' },
			{ type: 'smartflo_ivr', name: 'Smartflo IVR', logo: '/logos/smartflo.webp' },
			{ type: 'callerdesk', name: 'CallerDesk', logo: '/logos/callerdesk.webp' }
			];
			setIvrServices(fallbackServices);
			setSelectedIvrService(fallbackServices[0].type);
		} finally {
			setServicesLoading(false);
		}
		};

		loadData();
	}, [agentNumber]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
		if (isServiceDropdownOpen && !event.target.closest('.relative')) {
			setIsServiceDropdownOpen(false);
		}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
		document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isServiceDropdownOpen]);

	// Get service endpoint mapping
	const getServiceEndpoint = (serviceType) => {
		const serviceEndpoints = {
		'knowlarity': '/services/invite/callKnowlarity',
		'voxbay': '/services/invite/callVoxbay',
		'smartflo': '/services/invite/callSmartflo',
		'smartflo_ivr': '/services/invite/callSmartfloIVR',
		'callerdesk': '/services/invite/callCallerDeskIVR'
		};
		
		return serviceEndpoints[serviceType] || '/services/invite/callCallerDeskIVR';
	};

	// Call handler
	const handleCallNow = async () => {
		// Use the phone numbers passed as props/candidate data
		const clientPhone = candidate?.mobile || clientNumber;
		
		// For admin: use manual input if in manual mode and has value, otherwise use default or current user mobile
		// For non-admin: use the agentNumber prop or current user mobile
		let agentPhone;
		if (isAdmin) {
		if (agentInputMode === 'manual' && agentInput.trim()) {
			agentPhone = agentInput.trim();
		} else {
			agentPhone = agentNumber || currentUserMobile;
		}
		} else {
		agentPhone = agentNumber || currentUserMobile;
		}

		if (!clientPhone) {
		toast.error('Client phone number not available');
		return;
		}
		if (!agentPhone) {
		toast.error('Agent phone number not available');
		return;
		}
		if (!selectedIvrService) {
		toast.error('Please select an IVR service');
		return;
		}

		// Format numbers - different services expect different formats
		let formattedClientNumber = clientPhone.toString().trim().replace(/\D/g, '');
		let formattedAgentNumber = agentPhone.toString().trim().replace(/\D/g, '');
		
		// For most services, use +91 prefix format
		if (formattedClientNumber.length === 10) {
		formattedClientNumber = '+91' + formattedClientNumber;
		} else if (formattedClientNumber.length === 12 && formattedClientNumber.startsWith('91')) {
		formattedClientNumber = '+' + formattedClientNumber;
		} else if (!formattedClientNumber.startsWith('+91')) {
		toast.error('Invalid client phone number format');
		return;
		}
		
		if (formattedAgentNumber.length === 10) {
		formattedAgentNumber = '+91' + formattedAgentNumber;
		} else if (formattedAgentNumber.length === 12 && formattedAgentNumber.startsWith('91')) {
		formattedAgentNumber = '+' + formattedAgentNumber;
		} else if (!formattedAgentNumber.startsWith('+91')) {
		toast.error('Invalid agent phone number format');
		return;
		}
		
		setIsLoading(true);
		
		try {
		// Prepare payload based on service type
		const payload = {
			customerNumber: formattedClientNumber,
			agentNumber: formattedAgentNumber
		};
		
		// Add service-specific parameters
		if (selectedIvrService === 'voxbay') {
			// Voxbay requires additional parameters
			payload.agentExtNo = '100'; // Default extension, you might want to make this configurable
			payload.callerId = formattedAgentNumber; // Use agent number as caller ID by default
		}
		
		// Get the appropriate endpoint for selected service
		const endpoint = getServiceEndpoint(selectedIvrService);
		
		const response = await xFetch({
			path: endpoint,
			method: 'POST',
			payload: payload,
			isFormData: false // Use JSON payload instead of FormData
		});
		
		if (response.success || response.message) {
			toast.success(response.message || 'Call initiated successfully!');
			setTimeout(() => onClose?.(), 2000);
		} else if (response.error) {
			toast.error(response.error);
		} else {
			toast.error('Failed to initiate call');
		}
		} catch (err) {
		console.error('Call error:', err);
		toast.error(err.message || 'Failed to connect to call service');
		} finally {
		setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
		<ToastContainer position="bottom-right" autoClose={3000} />
		<div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 relative">
			{/* Header */}
			<div className="px-8 pt-8 pb-3 flex items-center justify-between">
			<h2 className="text-2xl font-medium text-gray-500">Initiate Call</h2>
			<button
				className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent -mr-2"
				onClick={onClose}
				disabled={isLoading}
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
				<path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
				</svg>
			</button>
			</div>

			{/* Content */}
			<div className="px-8 pb-6 pt-2 space-y-6">
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
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-2">Call Participants</label>
				<div className="bg-gray-50 rounded-lg p-4 space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Client:</span>
					<span className="text-sm font-medium text-gray-900">
					{candidateName || 'Customer'}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Agent:</span>
					<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-gray-900">
						{User?.name || 'Sales Representative'}
					</span>
					{isAdmin && (
						<button
						type="button"
						onClick={() => setAgentInputMode(agentInputMode === 'default' ? 'manual' : 'default')}
						className="text-xs text-blue-600 hover:text-blue-800 underline"
						disabled={isLoading}
						>
						{agentInputMode === 'default' ? 'Switch' : 'Default'}
						</button>
					)}
					</div>
				</div>
				{isAdmin && agentInputMode === 'manual' && (
					<div className="pt-2 border-t border-gray-200">
					<input
						type="tel"
						value={agentInput}
						onChange={(e) => setAgentInput(e.target.value)}
						placeholder="Enter agent phone number"
						className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
						disabled={isLoading}
					/>
					</div>
				)}
				</div>
			</div>

			{/* Call Button */}
			<button
				onClick={handleCallNow}
				disabled={isLoading || servicesLoading || ivrServices.length === 0 || !selectedIvrService}
				className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
			>
				{isLoading ? (
				<>
					<svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Connecting via {selectedIvrService && ivrServices.find(s => s.type === selectedIvrService)?.name}...
				</>
				) : (
				<>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
					</svg>
					Initiate Call
					{selectedIvrService && ivrServices.find(s => s.type === selectedIvrService) && (
					<span className="text-xs opacity-75">
						via {ivrServices.find(s => s.type === selectedIvrService).name}
					</span>
					)}
				</>
				)}
			</button>
			</div>
		</div>
		</div>
	);
}