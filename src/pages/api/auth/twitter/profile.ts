import cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse cookies to get access token
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.twitter_access_token;

  if (!accessToken) {
    return res
      .status(401)
      .json({ error: "No access token found. Please authenticate first." });
  }

  try {
    // Fetch user profile from Twitter API v2
    const userResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics,description,verified",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        return res
          .status(401)
          .json({ error: "Access token expired or invalid" });
      }
      const errorData = await userResponse.text();
      console.error("Profile fetch error:", errorData);
      return res.status(400).json({ error: "Failed to fetch user profile" });
    }

    const userData = await userResponse.json();

    res.status(200).json({
      success: true,
      user: userData.data,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
