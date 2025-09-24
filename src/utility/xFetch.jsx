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
  isFormData = false,
  responseType = 'json',
}) {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('access_token');

    const myHeaders = new Headers();
    if (!isFormData) {
      myHeaders.append("Content-Type", "application/json");
    }
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = { method, headers: myHeaders, redirect: "follow" };

    if (payload) {
      if (method !== 'GET') {
        if (isFormData) {
          requestOptions['body'] = payload;
        } else {
          requestOptions['body'] = JSON.stringify(payload);
        }
      } else {
        path = `${path}?${jsonToQueryParams(payload)}`;
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}${path}`, requestOptions)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (responseType === 'blob') {
          return await response.blob();
        }
        if (responseType === 'arrayBuffer') {
          return await response.arrayBuffer();
        }
        if (responseType === 'text') {
          return await response.text();
        }

        // default: JSON
        const text = await response.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error("Failed to parse JSON response:", text);
          throw new Error(`Invalid JSON response: ${err.message}`);
        }
      })
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
}
