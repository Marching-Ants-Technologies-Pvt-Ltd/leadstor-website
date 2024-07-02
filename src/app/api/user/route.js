import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";
import * as z from 'zod';

const accountSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Name is required'),
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Invalid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must have 8 characters')
    });

export async function POST(req) {

    try {

        const body = await req.json();
        const { email, name, password } = accountSchema.parse(body);

        //Check if email already registered
        const existingUserByEmail = await db.ls_auth.findUnique({
            where: { email: email }
        });

        if (existingUserByEmail) return NextResponse.json({ error: 'User already exist' }, { status: 409 });

        //Craete account
        const hashedPassword = await hash(password, 10);
        const uniqueId = uuidv4();
        const newAccount = await db.ls_auth.create({
            data: {
                uuid: uniqueId,
                email,
                name,
                provider: 'EMAIL',
                password: hashedPassword,
                image: ''
            }
        });

        return NextResponse.json({ message: "Account registered successfully" });

    } catch (error) {

        let errorMessage = 'Something went wrong!';
        if (!accountSchema.success) errorMessage = JSON.parse(error.message)[0].message;
        
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}