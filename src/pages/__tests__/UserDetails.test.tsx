import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import UserDetails from "../UserDetails";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { usersApi, albumsApi, photosApi } from "@/services/api";

// Mock dependencies
jest.mock("@/hooks/use-auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("@/services/api", () => ({
  usersApi: {
    getById: jest.fn(),
  },
  albumsApi: {
    getByUserId: jest.fn(),
  },
  photosApi: {
    getByAlbumId: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
};

const mockAlbums = [
  {
    id: 1,
    userId: 1,
    title: "Album 1",
  },
  {
    id: 2,
    userId: 1,
    title: "Album 2",
  },
];

const mockPhotos = {
  1: [
    {
      id: 1,
      albumId: 1,
      title: "Photo 1",
      url: "https://example.com/photo1.jpg",
      thumbnailUrl: "https://example.com/thumbnail1.jpg",
    },
  ],
  2: [
    {
      id: 2,
      albumId: 2,
      title: "Photo 2",
      url: "https://example.com/photo2.jpg",
      thumbnailUrl: "https://example.com/thumbnail2.jpg",
    },
  ],
};

const renderUserDetails = (userId: string = "1") => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/users/${userId}`]}>
          <Routes>
            <Route path="/users/:userId" element={<UserDetails />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("UserDetails Component", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (usersApi.getById as jest.Mock).mockResolvedValue(mockUser);
    (albumsApi.getByUserId as jest.Mock).mockResolvedValue(mockAlbums);
    mockAlbums.forEach((album) => {
      (photosApi.getByAlbumId as jest.Mock).mockResolvedValueOnce(
        mockPhotos[album.id]
      );
    });
  });

  it("renders loading state initially", () => {
    renderUserDetails();
    expect(screen.getByText("Loading user details...")).toBeInTheDocument();
  });

  it("renders user profile information", async () => {
    renderUserDetails();

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  it("renders user's albums", async () => {
    renderUserDetails();

    await waitFor(() => {
      expect(screen.getByText(mockAlbums[0].title)).toBeInTheDocument();
    });

    mockAlbums.forEach((album) => {
      expect(screen.getByText(album.title)).toBeInTheDocument();
      // Check if the album preview shows the correct photo count
      expect(
        screen.getByText(`${mockPhotos[album.id].length} photo`, {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  it("shows empty state when user has no albums", async () => {
    (albumsApi.getByUserId as jest.Mock).mockResolvedValueOnce([]);

    renderUserDetails();

    await waitFor(() => {
      expect(screen.getByText("No albums found")).toBeInTheDocument();
      expect(
        screen.getByText("This user hasn't created any albums yet.")
      ).toBeInTheDocument();
    });
  });

  it("shows error state when user fails to load", async () => {
    (usersApi.getById as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load user")
    );

    renderUserDetails();

    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The user you're looking for doesn't exist or has been removed."
        )
      ).toBeInTheDocument();
    });
  });

  it("redirects to login when not authenticated", () => {
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderUserDetails();

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows album count in user stats", async () => {
    renderUserDetails();

    await waitFor(() => {
      expect(
        screen.getByText(`${mockAlbums.length} albums`)
      ).toBeInTheDocument();
    });
  });

  it("shows total photo count in user stats", async () => {
    renderUserDetails();

    const totalPhotos = Object.values(mockPhotos).reduce(
      (sum, photos) => sum + photos.length,
      0
    );

    await waitFor(() => {
      expect(screen.getByText(`${totalPhotos} photos`)).toBeInTheDocument();
    });
  });
});
