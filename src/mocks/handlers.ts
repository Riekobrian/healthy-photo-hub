import { http, HttpResponse } from "msw";

// Define the type for the PATCH request body
interface UpdatePhotoTitleBody {
  title: string;
}

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
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid email profile",
      id_token: "mock_id_token",
    });
  }),

  // Mock Google user info
  http.get("https://www.googleapis.com/oauth2/v2/userinfo", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer mock_google_token") {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({
      id: "123",
      email: "test.google@example.com",
      verified_email: true,
      name: "Test Google User",
      picture: "https://example.com/google-avatar.jpg",
    });
  }),

  // Mock photo album photos
  http.get("https://jsonplaceholder.typicode.com/photos", () => {
    return HttpResponse.json(
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        albumId: Math.floor(i / 4) + 1,
        title: `Photo ${i + 1}`,
        url: "/mockImages/photo.jpg",
        thumbnailUrl: "/mockImages/thumbnail.jpg",
      }))
    );
  }),

  // Mock single photo
  http.get("https://jsonplaceholder.typicode.com/photos/:id", ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      albumId: Math.floor(Number(params.id) / 4) + 1,
      title: `Photo ${params.id}`,
      url: "/mockImages/photo.jpg",
      thumbnailUrl: "/mockImages/thumbnail.jpg",
    });
  }),

  // Mock photos by album
  http.get(
    "https://jsonplaceholder.typicode.com/albums/:id/photos",
    ({ params }) => {
      return HttpResponse.json(
        Array.from({ length: 4 }, (_, i) => ({
          id: (Number(params.id) - 1) * 4 + i + 1,
          albumId: Number(params.id),
          title: `Photo ${(Number(params.id) - 1) * 4 + i + 1}`,
          url: "/mockImages/photo.jpg",
          thumbnailUrl: "/mockImages/thumbnail.jpg",
        }))
      );
    }
  ),

  // Mock photo title update
  http.patch(
    "https://jsonplaceholder.typicode.com/photos/:id",
    async ({ request, params }) => {
      const body = (await request.json()) as UpdatePhotoTitleBody;
      console.log("Mock intercepted PATCH request:", {
        id: params.id,
        title: body.title,
      });

      return HttpResponse.json({
        id: Number(params.id),
        title: body.title,
        albumId: Math.floor(Number(params.id) / 4) + 1,
        url: "/mockImages/photo.jpg",
        thumbnailUrl: "/mockImages/thumbnail.jpg",
      });
    }
  ),
];
