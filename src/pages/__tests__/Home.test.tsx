import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Home from "../Home";
import { AuthProvider } from "../../context/AuthContext";
import { useAuth } from "../../hooks/use-auth";
import { photosApi, usersApi, type Photo } from "../../services/api";

jest.mock("../../hooks/use-auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("../../services/api", () => ({
  photosApi: {
    getAll: jest.fn(),
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

const mockPhotos: Photo[] = [
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

const renderHome = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("Home Component", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
      },
    });
    (photosApi.getAll as jest.Mock).mockResolvedValue(mockPhotos);
  });

  it("renders loading state initially", () => {
    renderHome();
    expect(screen.getByText(/loading photos/i)).toBeInTheDocument();
  });

  it("renders photos grid when data is loaded", async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
    });

    mockPhotos.forEach((photo) => {
      expect(screen.getByText(photo.title)).toBeInTheDocument();
      const img = screen.getByAltText(photo.title);
      expect(img).toHaveAttribute("src", photo.thumbnailUrl);
    });
  });

  it("handles empty state when no photos exist", async () => {
    (photosApi.getAll as jest.Mock).mockResolvedValueOnce([]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/no photos found/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/start by creating an album/i)).toBeInTheDocument();
  });

  it("handles error state", async () => {
    (photosApi.getAll as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/error loading photos/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderHome();

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to photo details when photo is clicked", async () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
    });

    const firstPhoto = screen.getByText(mockPhotos[0].title);
    fireEvent.click(firstPhoto);

    expect(mockNavigate).toHaveBeenCalledWith(`/photos/${mockPhotos[0].id}`);
  });

  it("retries loading on error when try again is clicked", async () => {
    (photosApi.getAll as jest.Mock)
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(mockPhotos);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/error loading photos/i)).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
    });

    expect(photosApi.getAll).toHaveBeenCalledTimes(2);
  });

  it("shows welcome message with user name", async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/welcome.*test user/i)).toBeInTheDocument();
    });
  });

  it("ensures photos are displayed in a responsive grid", async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
    });

    const grid = screen.getByRole("list");
    expect(grid).toHaveClass(
      "grid",
      "gap-4",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3"
    );
  });
});
