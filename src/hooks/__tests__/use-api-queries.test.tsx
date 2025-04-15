/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useUsers,
  useAlbums,
  useUserAlbums,
  useUser,
  useAlbumDetails,
} from "../use-api-queries";
import { usersApi, albumsApi, type User, type Album } from "../../services/api";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { describe, beforeEach, it, jest, expect } from "@jest/globals";

// Define typed mock functions
const mockGetAll = jest.fn() as jest.MockedFunction<typeof usersApi.getAll>;
const mockGetById = jest.fn() as jest.MockedFunction<typeof usersApi.getById>;
const mockAlbumsGetAll = jest.fn() as jest.MockedFunction<
  typeof albumsApi.getAll
>;
const mockAlbumsGetById = jest.fn() as jest.MockedFunction<
  typeof albumsApi.getById
>;
const mockGetByUserId = jest.fn() as jest.MockedFunction<
  typeof albumsApi.getByUserId
>;

// Mock the API modules with typed mocks
jest.mock("../../services/api", () => ({
  usersApi: {
    getAll: mockGetAll,
    getById: mockGetById,
  },
  albumsApi: {
    getAll: mockAlbumsGetAll,
    getById: mockAlbumsGetById,
    getByUserId: mockGetByUserId,
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("API Query Hooks", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  describe("useUsers", () => {
    it("fetches users successfully", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: "User 1",
          email: "user1@example.com",
          username: "user1",
        },
        {
          id: 2,
          name: "User 2",
          email: "user2@example.com",
          username: "user2",
        },
      ];

      mockGetAll.mockResolvedValueOnce(mockUsers);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUsers);
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles error state", async () => {
      mockGetAll.mockRejectedValueOnce(new Error("Failed to fetch"));

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useUser", () => {
    it("fetches single user successfully", async () => {
      const mockUser: User = {
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        username: "user1",
      };
      mockGetById.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useUser("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUser);
      });
    });

    it("doesn't fetch when id is empty", () => {
      const { result } = renderHook(() => useUser(""), { wrapper });

      expect(mockGetById).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useAlbums", () => {
    it("fetches albums successfully", async () => {
      const mockAlbums: Album[] = [
        { id: 1, userId: 1, title: "Album 1" },
        { id: 2, userId: 1, title: "Album 2" },
      ];

      mockAlbumsGetAll.mockResolvedValueOnce(mockAlbums);

      const { result } = renderHook(() => useAlbums(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockAlbums);
      });
    });
  });

  describe("useUserAlbums", () => {
    it("fetches user albums successfully", async () => {
      const mockAlbums = [
        { id: 1, userId: 1, title: "Album 1" },
        { id: 2, userId: 1, title: "Album 2" },
      ];

      mockGetByUserId.mockResolvedValueOnce(mockAlbums);

      const { result } = renderHook(() => useUserAlbums("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockAlbums);
      });
    });

    it("doesn't fetch when userId is empty", () => {
      const { result } = renderHook(() => useUserAlbums(""), { wrapper });

      expect(mockGetByUserId).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useAlbumDetails", () => {
    it("fetches album details successfully", async () => {
      const mockAlbum = { id: 1, userId: 1, title: "Album 1" };

      mockAlbumsGetById.mockResolvedValueOnce(mockAlbum);

      const { result } = renderHook(() => useAlbumDetails("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockAlbum);
      });
    });

    it("handles error state", async () => {
      mockAlbumsGetById.mockRejectedValueOnce(new Error("Failed to fetch"));

      const { result } = renderHook(() => useAlbumDetails("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});
