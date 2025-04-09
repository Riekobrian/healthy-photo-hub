import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock GitHub OAuth token exchange
  http.post("https://github.com/login/oauth/access_token", () => {
    return HttpResponse.json({
      access_token: "mock_github_token",
      token_type: "bearer",
      scope: "user,user:email",
    });
  }),

  // Mock GitHub user data
  http.get("https://api.github.com/user", () => {
    return HttpResponse.json({
      id: 123,
      login: "testuser",
      name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
    });
  }),

  // Mock GitHub user emails
  http.get("https://api.github.com/user/emails", () => {
    return HttpResponse.json([
      {
        email: "test@example.com",
        primary: true,
        verified: true,
        visibility: "public",
      },
    ]);
  }),

  // Mock Google OAuth token exchange
  http.post("https://oauth2.googleapis.com/token", () => {
    return HttpResponse.json({
      access_token: "mock_google_token",
      token_type: "bearer",
      scope: "openid email profile",
    });
  }),

  // Mock Google user info
  http.get("https://www.googleapis.com/oauth2/v3/userinfo", () => {
    return HttpResponse.json({
      sub: "123",
      name: "Test Google User",
      email: "test.google@example.com",
      picture: "https://example.com/google-avatar.jpg",
    });
  }),
];
