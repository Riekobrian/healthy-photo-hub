import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = request.body;

    if (!code) {
      return response.status(400).json({ error: "Code is required" });
    }

    const githubResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.VITE_GITHUB_CLIENT_ID,
          client_secret: process.env.VITE_GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const data = await githubResponse.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return response.status(500).json({
      error: "Failed to exchange code for token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
