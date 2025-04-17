import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const handler: Handler = async (event) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed",
    };
  }

  try {
    const { code, redirect_uri } = JSON.parse(event.body || "{}");

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Code is required" }),
      };
    }

    // Use NETLIFY_ prefixed environment variables for Netlify Functions
    const clientId = process.env.NETLIFY_GITHUB_CLIENT_ID;
    const clientSecret = process.env.NETLIFY_GITHUB_CLIENT_SECRET;
    const defaultRedirectUri = process.env.NETLIFY_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      console.error("Missing GitHub OAuth credentials");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirect_uri || defaultRedirectUri,
        }),
      }
    );

    const data = await response.json();

    // Log the response for debugging (will appear in Netlify Function logs)
    console.log("GitHub OAuth response:", data);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to exchange code for token",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export { handler };
