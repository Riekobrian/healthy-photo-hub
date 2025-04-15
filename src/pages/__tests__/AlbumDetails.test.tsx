import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import AlbumDetails from "../AlbumDetails";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { photosApi, albumsApi, usersApi } from "@/services/api";

// Mock dependencies including useNavigate
jest.mock("@/hooks/use-auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("@/services/api", () => ({
  photosApi: {
    getByAlbumId: jest.fn(),
  },
  albumsApi: {
    getById: jest.fn(),
  },
  usersApi: {
    getById: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockAlbum = {
  id: 1,
  userId: 1,
  title: "Test Album",
};

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
};

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

const renderAlbumDetails = (albumId: string = "1") => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/albums/${albumId}`]}>
          <Routes>
            <Route path="/albums/:albumId" element={<AlbumDetails />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("AlbumDetails Component", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (albumsApi.getById as jest.Mock).mockResolvedValue(mockAlbum);
    (usersApi.getById as jest.Mock).mockResolvedValue(mockUser);
    (photosApi.getByAlbumId as jest.Mock).mockResolvedValue(mockPhotos);
  });

  it("renders loading state initially", () => {
    renderAlbumDetails();
    expect(screen.getByText("Loading album details...")).toBeInTheDocument();
  });

  it("renders album details when data is loaded", async () => {
    renderAlbumDetails();

    await waitFor(() => {
      expect(screen.getByText(mockAlbum.title)).toBeInTheDocument();
    });

    expect(
      screen.getByText(mockUser.name, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`This album contains ${mockPhotos.length} photos`)
    ).toBeInTheDocument();
  });

  it("renders photos grid", async () => {
    renderAlbumDetails();

    await waitFor(() => {
      expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
    });

    mockPhotos.forEach((photo) => {
      expect(screen.getByText(photo.title)).toBeInTheDocument();
      const photoImage = screen.getByAltText(photo.title);
      expect(photoImage).toHaveAttribute("src", photo.thumbnailUrl);
    });
  });

  it("shows empty state when album has no photos", async () => {
    (photosApi.getByAlbumId as jest.Mock).mockResolvedValueOnce([]);

    renderAlbumDetails();

    await waitFor(() => {
      expect(screen.getByText("No photos in this album")).toBeInTheDocument();
      expect(
        screen.getByText("This album is currently empty.")
      ).toBeInTheDocument();
    });
  });

  it("shows error state when album fails to load", async () => {
    (albumsApi.getById as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load album")
    );

    renderAlbumDetails();

    await waitFor(() => {
      expect(screen.getByText("Album not found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The album you're looking for doesn't exist or has been removed."
        )
      ).toBeInTheDocument();
    });
  });

  it("redirects to login when not authenticated", () => {
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderAlbumDetails();

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows back button linking to user profile", async () => {
    renderAlbumDetails();

    await waitFor(() => {
      expect(
        screen.getByText(mockUser.name, { exact: false })
      ).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", {
      name: /back to .+'s profile/i,
    });
    expect(backButton).toBeInTheDocument();
  });
});
