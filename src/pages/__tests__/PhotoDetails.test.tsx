import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import PhotoDetails from "../PhotoDetails";
import { AuthProvider } from "../../context/AuthContext";
import { useAuth } from "../../hooks/use-auth";
import { photosApi, albumsApi, usersApi } from "../../services/api";
import { toast } from "../../hooks/use-toast";

// Mock dependencies
jest.mock("../../hooks/use-auth");
jest.mock("../../hooks/use-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("../../services/api", () => ({
  photosApi: {
    getById: jest.fn(),
    updateTitle: jest.fn(),
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
    mutations: { retry: false },
  },
});

const mockPhoto = {
  id: 1,
  albumId: 1,
  title: "Test Photo",
  url: "https://example.com/photo.jpg",
  thumbnailUrl: "https://example.com/thumbnail.jpg",
};

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

const renderPhotoDetails = (photoId: string = "1") => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/photos/${photoId}`]}>
          <Routes>
            <Route path="/photos/:photoId" element={<PhotoDetails />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("PhotoDetails Component", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (photosApi.getById as jest.Mock).mockResolvedValue(mockPhoto);
    (albumsApi.getById as jest.Mock).mockResolvedValue(mockAlbum);
    (usersApi.getById as jest.Mock).mockResolvedValue(mockUser);
  });

  it("renders loading state initially", () => {
    renderPhotoDetails();
    expect(screen.getByText("Loading photo details...")).toBeInTheDocument();
  });

  it("renders photo details when data is loaded", async () => {
    renderPhotoDetails();

    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    });

    expect(screen.getByRole("img")).toHaveAttribute("src", mockPhoto.url);
    expect(
      screen.getByText(mockUser.name, { exact: false })
    ).toBeInTheDocument();
  });

  it("handles title editing", async () => {
    const updatedPhoto = { ...mockPhoto, title: "Updated Title" };
    (photosApi.updateTitle as jest.Mock).mockResolvedValueOnce(updatedPhoto);

    renderPhotoDetails();

    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByRole("textbox");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(photosApi.updateTitle).toHaveBeenCalledWith(1, "Updated Title");

    await waitFor(() => {
      expect(screen.getByText("Updated Title")).toBeInTheDocument();
    });
    expect(toast).toHaveBeenCalledWith({
      title: "Success",
      description: expect.any(String),
    });
  });

  it("handles edit cancellation", async () => {
    renderPhotoDetails();

    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByRole("textbox");
    fireEvent.change(titleInput, { target: { value: "Unsaved Changes" } });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("handles error when updating title", async () => {
    (photosApi.updateTitle as jest.Mock).mockRejectedValueOnce(
      new Error("Update failed")
    );

    renderPhotoDetails();

    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByRole("textbox");
    fireEvent.change(titleInput, { target: { value: "Will Fail" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: expect.any(String),
        variant: "destructive",
      });
    });
  });

  it("redirects to login when not authenticated", () => {
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderPhotoDetails();

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
