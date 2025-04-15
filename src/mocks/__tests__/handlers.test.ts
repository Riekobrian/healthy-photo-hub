import { http, HttpResponse } from "msw";
import { server } from "../server";
import { handlers } from "../handlers";

describe("API Handlers", () => {
  // GitHub OAuth tests
  describe("GitHub OAuth", () => {
    it("should handle GitHub OAuth token exchange", async () => {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
        }
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        access_token: "mock_github_token",
        token_type: "bearer",
        scope: "user,user:email",
      });
    });

    it("should handle GitHub user data request", async () => {
      const response = await fetch("https://api.github.com/user");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        id: 123,
        login: "testuser",
        name: "Test User",
        avatar_url: "https://example.com/avatar.jpg",
      });
    });

    it("should handle GitHub user emails request", async () => {
      const response = await fetch("https://api.github.com/user/emails");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual([
        {
          email: "test@example.com",
          primary: true,
          verified: true,
          visibility: "public",
        },
      ]);
    });
  });

  // Google OAuth tests
  describe("Google OAuth", () => {
    it("should handle Google OAuth token exchange", async () => {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        access_token: "mock_google_token",
        token_type: "bearer",
        scope: "openid email profile",
      });
    });

    it("should handle Google user info request", async () => {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo"
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        sub: "123",
        name: "Test Google User",
        email: "test.google@example.com",
        picture: "https://example.com/google-avatar.jpg",
      });
    });
  });

  // Photo API tests
  describe("Photo API", () => {
    it("should handle photo title update", async () => {
      const photoId = "1";
      const newTitle = "Updated Photo Title";

      const response = await fetch(
        `https://jsonplaceholder.typicode.com/photos/${photoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        }
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        id: 1,
        title: newTitle,
        albumId: 1,
        url: `https://via.placeholder.com/600/${photoId}`,
        thumbnailUrl: `https://via.placeholder.com/150/${photoId}`,
      });
    });
  });
});

describe("Mock Handlers", () => {
  describe("GitHub OAuth handlers", () => {
    it("should mock GitHub access token endpoint", async () => {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
        }
      );
      const data = await response.json();

      expect(data).toEqual({
        access_token: "mock_github_token",
        token_type: "bearer",
        scope: "user,user:email",
      });
    });

    it("should mock GitHub user data endpoint", async () => {
      const response = await fetch("https://api.github.com/user");
      const data = await response.json();

      expect(data).toEqual({
        id: 123,
        login: "testuser",
        name: "Test User",
        avatar_url: "https://example.com/avatar.jpg",
      });
    });

    it("should mock GitHub user emails endpoint", async () => {
      const response = await fetch("https://api.github.com/user/emails");
      const data = await response.json();

      expect(data).toEqual([
        {
          email: "test@example.com",
          primary: true,
          verified: true,
          visibility: "public",
        },
      ]);
    });
  });

  describe("Google OAuth handlers", () => {
    it("should mock Google token endpoint", async () => {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
      });
      const data = await response.json();

      expect(data).toEqual({
        access_token: "mock_google_token",
        token_type: "bearer",
        scope: "openid email profile",
      });
    });

    it("should mock Google user info endpoint", async () => {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo"
      );
      const data = await response.json();

      expect(data).toEqual({
        sub: "123",
        name: "Test Google User",
        email: "test.google@example.com",
        picture: "https://example.com/google-avatar.jpg",
      });
    });
  });

  describe("Photo API handlers", () => {
    it("should mock photo title update endpoint", async () => {
      const photoId = "123";
      const newTitle = "Updated Photo Title";

      const response = await fetch(
        `https://jsonplaceholder.typicode.com/photos/${photoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        }
      );

      const data = await response.json();
      expect(data).toEqual({
        id: Number(photoId),
        title: newTitle,
        albumId: 1,
        url: `https://via.placeholder.com/600/${photoId}`,
        thumbnailUrl: `https://via.placeholder.com/150/${photoId}`,
      });
    });

    it("should handle photo title update with different photo IDs", async () => {
      const testCases = ["1", "42", "999"];

      for (const photoId of testCases) {
        const newTitle = `Updated Photo ${photoId}`;
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/photos/${photoId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        const data = await response.json();
        expect(data).toEqual({
          id: Number(photoId),
          title: newTitle,
          albumId: 1,
          url: `https://via.placeholder.com/600/${photoId}`,
          thumbnailUrl: `https://via.placeholder.com/150/${photoId}`,
        });
      }
    });
  });
});

describe("MSW Handlers", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("handles GitHub OAuth token exchange", async () => {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
    });
    const data = await response.json();
    
    expect(data).toEqual({
      access_token: "mock_github_token",
      token_type: "bearer",
      scope: "user,user:email"
    });
  });

  it("handles Google OAuth token exchange", async () => {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
    });
    const data = await response.json();
    
    expect(data).toEqual({
      access_token: "mock_google_token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid email profile",
      id_token: "mock_id_token"
    });
  });

  it("handles Google userinfo request with valid token", async () => {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: "Bearer mock_google_token" }
    });
    const data = await response.json();
    
    expect(data).toEqual({
      id: "123",
      email: "test.google@example.com",
      verified_email: true,
      name: "Test Google User",
      picture: "https://example.com/google-avatar.jpg"
    });
  });

  it("handles Google userinfo request with invalid token", async () => {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: "Bearer invalid_token" }
    });
    expect(response.status).toBe(401);
  });

  it("handles photo listing request", async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos");
    const data = await response.json();
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(12);
    expect(data[0]).toEqual({
      id: 1,
      albumId: 1,
      title: "Photo 1",
      url: "/mockImages/photo.jpg",
      thumbnailUrl: "/mockImages/thumbnail.jpg"
    });
  });

  it("handles single photo request", async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos/1");
    const data = await response.json();
    
    expect(data).toEqual({
      id: 1,
      albumId: 1,
      title: "Photo 1",
      url: "/mockImages/photo.jpg",
      thumbnailUrl: "/mockImages/thumbnail.jpg"
    });
  });

  it("handles photos by album request", async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/albums/1/photos");
    const data = await response.json();
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe 4);
    expect(data[0]).toEqual({
      id: 1,
      albumId: 1,
      title: "Photo 1",
      url: "/mockImages/photo.jpg",
      thumbnailUrl: "/mockImages/thumbnail.jpg"
    });
  });

  it("handles photo title update request", async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Updated Title" })
    });
    const data = await response.json();
    
    expect(data).toEqual({
      id: 1,
      albumId: 1,
      title: "Updated Title",
      url: "/mockImages/photo.jpg",
      thumbnailUrl: "/mockImages/thumbnail.jpg"
    });
  });
});
