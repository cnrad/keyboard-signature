import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString("hex");

  // Encode session data in the state parameter itself
  const sessionData = {
    state: state,
    codeVerifier: codeVerifier,
    timestamp: Date.now(),
  };

  // Base64 encode the session data and append to state
  const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString(
    "base64url",
  );
  const stateWithSession = `${state}.${encodedSession}`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`,
    scope: "tweet.read users.read offline.access",
    state: stateWithSession,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  res.redirect(authUrl);
}
