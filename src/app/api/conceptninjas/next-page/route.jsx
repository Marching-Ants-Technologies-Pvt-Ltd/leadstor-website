import { NextResponse } from "next/server";

export async function POST(req) {

    try {

        const { api_token } = await req.json();
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ api_token }),
            redirect: "follow"
        };

        const response = await fetch(`${process.env.CONCEPTNINJAS_URL}/nextPage`, requestOptions);
        const result = await response.json();

        if (result.page && result.page === 'DASHBOARD') result.page_url = `${process.env.CONCEPTNINJAS_URL}/dashboard`;

        return NextResponse.json(result, { status: response.status });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}