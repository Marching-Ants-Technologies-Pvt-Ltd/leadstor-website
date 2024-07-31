import { NextResponse } from "next/server";
import * as z from 'zod';

const contactFormSchema = z.object({
    name: z
        .string()
        .min(3, 'First name is required'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    message: z
        .string()
        .min(3, 'Enter your query before you submit the form')
});

export async function POST(req) {

    try {

        const data = await req.json();

        const payload = {
            source: "Leadstor",
            location: "",
            name: data.firstName,
            email: data.email,
            mobile: data.phone,
            course: data.query,
            message: data.message
        };

        await contactFormSchema.parse(payload);
        if (data.lastName.length > 0) payload.name += ` ${data.lastName}`;

        const gcData = `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${data.token}`;
        const gcResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: gcData,
        });

        const gcResponseContent = await gcResponse.json();
        if (!gcResponseContent.success) return NextResponse.json({ error: 'reCAPTCHA validation failed', details: data['error-codes'] }, { status: 400 });
        
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(payload),
            redirect: "follow"
        };

        const cnResponse = await fetch(`${process.env.CONTACT_FORM_URL}`, requestOptions);
        if(cnResponse.status !== 200) return NextResponse.json({ error: 'Unable to process your request! Please try again later!' }, { status: 404 });
        
        return NextResponse.json({ message: 'Thanks!' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}