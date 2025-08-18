import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: `Twitter OAuth error: ${error}` });
  }

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state parameter" });
  }

  try {
    // Decode session data from state parameter
    const [originalState, encodedSession] = (state as string).split(".");
    if (!encodedSession) {
      return res.status(400).json({ error: "Invalid state format" });
    }

    const sessionData = JSON.parse(
      Buffer.from(encodedSession, "base64url").toString(),
    );

    // Verify state matches
    if (originalState !== sessionData.state) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }

    // Check timestamp (10 minute expiry)
    if (Date.now() - sessionData.timestamp > 600000) {
      return res.status(400).json({ error: "Session expired" });
    }

    // Exchange code for token using stored code verifier
    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`,
          code_verifier: sessionData.codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return res
        .status(400)
        .json({ error: "Failed to exchange code for token" });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Try to set cookies for tokens (if this fails, you'll need a different storage method)
    res.setHeader("Set-Cookie", [
      `twitter_access_token=${access_token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Lax`,
      `twitter_refresh_token=${refresh_token}; HttpOnly; Path=/; Max-Age=7776000; SameSite=Lax`,
    ]);

    res.redirect("/dashboard?auth=success");
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
