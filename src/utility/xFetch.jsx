"use client";

function jsonToQueryParams(json) {
    return Object.keys(json)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key]))
        .join("&");
}

export async function xFetch({
    method = 'GET',
    path = '',
    payload = null,
}) {

    return new Promise((resolve, reject) => {
        
        // Get token
        const token = localStorage.getItem('access_token');

        // Set headers
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        // Compose request options
        const requestOptions = { method, headers: myHeaders, redirect: "follow" };

        // Handel payload
        if (payload) {
            if (method !== 'GET') {
                requestOptions['body'] = JSON.stringify(payload);
            } else {
                path = `${path}?${jsonToQueryParams(payload)}`;
            }
        }

        // Make API call
        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}${path}`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
}