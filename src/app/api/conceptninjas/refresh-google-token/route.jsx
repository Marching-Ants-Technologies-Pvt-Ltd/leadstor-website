// app/api/refresh-google-token/route.ts  (Next.js App Router)
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 });
    }

    const client_id     = process.env.GOOGLE_DRIVE_CLIENT_ID;     // server-only
    const client_secret = process.env.GOOGLE_DRIVE_CLIENT_SECRET; // server-only

    if (!client_id || !client_secret) {
      console.error('Missing Google credentials in env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const params = new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Google token refresh failed:', data);
      return NextResponse.json(data, { status: res.status });
    }

    // Optionally store new access_token somewhere (e.g. DB, cookies, etc.)
    return NextResponse.json({ access_token: data.access_token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}