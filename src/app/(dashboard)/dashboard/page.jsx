'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast, Bounce } from 'react-toastify';

export default function Dashboard() {
    const router = useRouter();

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <h3>Hi, Welcome Back!</h3>
            <p>This page is currently under construction.</p>
            <button onClick={(e) => toast.error('Leadstor v1.0.3')}>Toast</button>
        </div>
    );
}