import { NextResponse } from "next/server";

export async function POST(req) {

    try {

        let body = await req.json();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };

        const response = await fetch(`${process.env.CONCEPTNINJAS_URL}/setOnboardingInfo`, requestOptions);
        const result = await response.json();

        return NextResponse.json(result, { status: response.status });

    } catch (error) {
        
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}