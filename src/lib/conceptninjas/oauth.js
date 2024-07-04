const oauth = async ({
    email,
    uuid = "",
    password = "",
    first_name = "",
    last_name = "",
    image = "",
    auth_provider = "NA"
}) => {

    const service_url = process.env.CONCEPTNINJAS_URL;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "uuid": uuid,
        "email": email,
        "fname": first_name,
        "lname": last_name,
        "auth_mode": auth_provider,
        "password": password,
        "image": image
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    const suffix = (auth_provider === 'EMAIL' && first_name.length>3) ? 'signupWithEmail' : 'oauth';

    console.log('Suffix', suffix, 'Data', raw);

    try {
        const response = await fetch(`${service_url}/${suffix}`, requestOptions);
        const result = await response.json();
        return result;
    } catch (error) {
        return error;
    }
}

export default oauth;