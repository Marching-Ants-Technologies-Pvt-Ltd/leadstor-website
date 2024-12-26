"use client";

import Image from 'next/image';
import FbConnect from './partials/connect';
import FbConnected from './partials/connected';
import Spinner from '@/components/elements/Spinner';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function FacebookIntegration() {

    const [isLoggedIn, setIsLoggedIn] = useState(0);
    const [accessToken, setAccessToken] = useState(null);
    const userData = JSON.parse(localStorage.getItem('session_user'));

    useEffect(() => {
        // Initialize Facebook SDK
        window.fbAsyncInit = function () {
            FB.init({
                appId: process.env.NEXT_PUBLIC_FB_APP_ID,
                xfbml: true,
                autoLogAppEvents: true,
                version: 'v21.0',
            });

            // Check login status
            FB.getLoginStatus(function (response) {
                statusChangeCallback(response);
            });
        };
    }, []);

    const statusChangeCallback = (response) => {
        if (response.status === 'connected') {
            console.log('User logged in, Requesting FB extended token', response.authResponse.accessToken);
            getExtendedUserToken(response.authResponse.accessToken);
        } else {
            setIsLoggedIn(1);
            setAccessToken(null);
        }
    };

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${userData.cn_token ?? ''}`);

    const getExtendedUserToken = (token) => {

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/facebook/getExtendedUserToken?userToken=${token}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log('Extended Token', result.access_token);
                FB.api(`/me/accounts?access_token=${result.access_token}`, function (response) {
                    console.log('Successfully retrieved pages.', response);
                    setAccessToken(response);
                    setIsLoggedIn(2);
                });
            })
            .catch((error) => {
                setIsLoggedIn(1);
                setAccessToken(null);
            });
    }

    const handleLogin = () => {
        FB.login(
            (response) => {
                if (response.authResponse) {
                    console.log('User logged in:', response.authResponse);
                    statusChangeCallback(response);
                } else {
                    console.warn('User cancelled login');
                }
            },
            { scope: 'public_profile,email,pages_show_list,pages_read_engagement' }
        );
    };

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md">
            <div className="flex border-b py-4 px-7 gap-4">
                <div className='flex-grow-0'>
                    <Image
                        className='rounded-md pointer-events-none'
                        placeholder='empty'
                        src='/icons/services/facebook.webp'
                        width={45}
                        height={45}
                        alt="WhatsApp Icon"
                        priority={false}
                    />
                </div>
                <div className="flex-1 flex justify-start items-center section-info">
                    <div>
                        <h2 className="text-gray-700 poppins text-2xl font-semibold">Facebook Integration</h2>
                    </div>
                </div>
                <div className="h-11 poppins flex justify-center flex-col items-end text-gray-700 text-sm cursor-pointer">
                    <div>v21.0 &bull; Meta SDK</div>
                    <div></div>
                </div>
            </div>

            <Script
                async
                defer
                crossorigin="anonymous"
                src="https://connect.facebook.net/en_US/sdk.js"
            />

            {(isLoggedIn > 1) ? <FbConnected token={accessToken} user={userData} /> : ((isLoggedIn < 1) ? <Spinner /> : <FbConnect fbConnectButton={handleLogin} />)}
        </div>
    );
}