"use client";

export function jsonToQueryParams(json) {
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

export async function xDownload(nextTarget, duration = 2000) {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('access_token not found in localStorage');
    return;
  }

  const popup = window.open('', '_blank');
  if (!popup) {
    console.warn('Popup blocked by browser');
    return;
  }

  // Build the form in the new window
  const doc = popup.document;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/leadstor/dashboard`;

  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token';
  tokenInput.value = token;

  const nextTargetInput = document.createElement('input');
  nextTargetInput.type = 'hidden';
  nextTargetInput.name = 'nextTarget';
  nextTargetInput.value = nextTarget;

  form.appendChild(tokenInput);
  form.appendChild(nextTargetInput);

  doc.body.appendChild(form);
  form.submit();

  // Close the window after a delay
  setTimeout(() => {
    popup.close();
  }, duration);

}