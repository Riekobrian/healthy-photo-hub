import { photosApi, usersApi, albumsApi } from "../api";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

describe("API Services", () => {
  describe("photosApi", () => {
    it("fetches a photo by ID", async () => {
      const mockPhoto = {
        id: 1,
        albumId: 1,
        title: "Test Photo",
        url: "https://example.com/photo.jpg",
        thumbnailUrl: "https://example.com/thumbnail.jpg",
      };

      server.use(
        http.get("https://jsonplaceholder.typicode.com/photos/1", () => {
          return HttpResponse.json(mockPhoto);
        })
      );

      const photo = await photosApi.getById(1);
      expect(photo).toEqual(mockPhoto);
    });

    it("updates a photo title", async () => {
      const updatedPhoto = {
        id: 1,
        albumId: 1,
        title: "Updated Title",
        url: "https://example.com/photo.jpg",
        thumbnailUrl: "https://example.com/thumbnail.jpg",
      };

      server.use(
        http.patch("https://jsonplaceholder.typicode.com/photos/1", () => {
          return HttpResponse.json(updatedPhoto);
        })
      );

      const result = await photosApi.updateTitle(1, "Updated Title");
      expect(result).toEqual(updatedPhoto);
    });

    it("fetches photos by album ID", async () => {
      const mockPhotos = [
        {
          id: 1,
          albumId: 1,
          title: "Photo 1",
          url: "https://example.com/photo1.jpg",
          thumbnailUrl: "https://example.com/thumbnail1.jpg",
        },
        {
          id: 2,
          albumId: 1,
          title: "Photo 2",
          url: "https://example.com/photo2.jpg",
          thumbnailUrl: "https://example.com/thumbnail2.jpg",
        },
      ];

      server.use(
        http.get("https://jsonplaceholder.typicode.com/albums/1/photos", () => {
          return HttpResponse.json(mockPhotos);
        })
      );

      const photos = await photosApi.getByAlbumId(1);
      expect(photos).toEqual(mockPhotos);
    });
  });

  describe("usersApi", () => {
    it("fetches a user by ID", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
      };

      server.use(
        http.get("https://jsonplaceholder.typicode.com/users/1", () => {
          return HttpResponse.json(mockUser);
        })
      );

      const user = await usersApi.getById(1);
      expect(user).toEqual(mockUser);
    });

    it("fetches all users", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "User 1",
          username: "user1",
          email: "user1@example.com",
        },
        {
          id: 2,
          name: "User 2",
          username: "user2",
          email: "user2@example.com",
        },
      ];

      server.use(
        http.get("https://jsonplaceholder.typicode.com/users", () => {
          return HttpResponse.json(mockUsers);
        })
      );

      const users = await usersApi.getAll();
      expect(users).toEqual(mockUsers);
    });
  });

  describe("albumsApi", () => {
    it("fetches an album by ID", async () => {
      const mockAlbum = {
        id: 1,
        userId: 1,
        title: "Test Album",
      };

      server.use(
        http.get("https://jsonplaceholder.typicode.com/albums/1", () => {
          return HttpResponse.json(mockAlbum);
        })
      );

      const album = await albumsApi.getById(1);
      expect(album).toEqual(mockAlbum);
    });

    it("fetches albums by user ID", async () => {
      const mockAlbums = [
        { id: 1, userId: 1, title: "Album 1" },
        { id: 2, userId: 1, title: "Album 2" },
      ];

      server.use(
        http.get("https://jsonplaceholder.typicode.com/users/1/albums", () => {
          return HttpResponse.json(mockAlbums);
        })
      );

      const albums = await albumsApi.getByUserId(1);
      expect(albums).toEqual(mockAlbums);
    });

    it("handles API errors correctly", async () => {
      server.use(
        http.get("https://jsonplaceholder.typicode.com/albums/999", () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(albumsApi.getById(999)).rejects.toThrow(
        "API request failed: 404"
      );
    });
  });
});
