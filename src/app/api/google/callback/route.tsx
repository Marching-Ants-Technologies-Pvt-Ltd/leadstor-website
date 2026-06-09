import { NextRequest } from "next/server";

function popupResponse(payload: Record<string, any>) {
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <body>
        <script>
          (function () {
            try {
              if (window.opener) {
                window.opener.postMessage(${JSON.stringify(payload)}, window.location.origin);
              }
            } catch (e) {}
            window.close();
          })();
        </script>
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const oauthError = req.nextUrl.searchParams.get("error");
    const state = req.nextUrl.searchParams.get("state");

    let corporateId = "";
    if (state) {
      try {
        const parsedState = JSON.parse(
          Buffer.from(state, "base64url").toString("utf8")
        );
        corporateId = String(parsedState?.corporateId || "");
      } catch (err) {
        console.error("Invalid OAuth state:", err);
      }
    }

    if (oauthError) {
      return popupResponse({
        type: "GOOGLE_DRIVE_ERROR",
        message: "Google authentication was cancelled or failed",
      });
    }

    if (!code) {
      return popupResponse({
        type: "GOOGLE_DRIVE_ERROR",
        message: "Google authentication failed",
      });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google Token Error:", tokenData);
      return popupResponse({
        type: "GOOGLE_DRIVE_ERROR",
        message:
          tokenData.error_description ||
          tokenData.error ||
          "Failed to authenticate with Google",
      });
    }

    const refreshToken = tokenData.refresh_token;

    if (!refreshToken) {
      return popupResponse({
        type: "GOOGLE_DRIVE_ERROR",
        message:
          "Google did not return refresh token. Reconnect and allow all permissions.",
      });
    }

    // Optional server-side save attempt; UI still saves token as fallback.
    if (process.env.NEXT_PUBLIC_LEADSTOR_REST && corporateId) {
      try {
        const formData = new FormData();
        formData.append("corporateId", corporateId);
        formData.append("drive_token", refreshToken);

        await fetch(
          `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/widget/saveGoogleDriveToken`,
          {
            method: "POST",
            body: formData,
          }
        );
      } catch (saveErr) {
        console.error("Server-side Google token save failed:", saveErr);
      }
    }

    return popupResponse({
      type: "GOOGLE_DRIVE_CONNECTED",
      refreshToken,
      corporateId,
      message: "Google Drive connected successfully",
    });
  } catch (error: any) {
    console.error("Google OAuth Error:", error);

    return popupResponse({
      type: "GOOGLE_DRIVE_ERROR",
      message: "Google authentication failed",
    });
  }
}
