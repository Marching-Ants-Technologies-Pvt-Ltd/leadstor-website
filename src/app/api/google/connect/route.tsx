import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const redirectUri =
    `${process.env.NEXTAUTH_URL}/api/google/callback`;
  const corporateId =
    req.nextUrl.searchParams.get("corporateId") || "";
  const state = Buffer.from(
    JSON.stringify({ corporateId })
  ).toString("base64url");

  
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive",
      access_type: "offline",
      prompt: "consent",
      state,
    });

  return NextResponse.redirect(url);
}
