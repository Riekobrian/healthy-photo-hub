import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PhotoCard from "../PhotoCard";
import { Photo } from "@/services/api";

const mockPhoto: Photo = {
  id: 1,
  albumId: 1,
  title: "Test Photo",
  url: "https://example.com/photo.jpg",
  thumbnailUrl: "https://example.com/thumbnail.jpg",
};

const renderPhotoCard = (photo: Photo = mockPhoto) => {
  return render(
    <MemoryRouter>
      <PhotoCard photo={photo} />
    </MemoryRouter>
  );
};

describe("PhotoCard Component", () => {
  it("renders photo with title and thumbnail", () => {
    renderPhotoCard();

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", mockPhoto.thumbnailUrl);
    expect(image).toHaveAttribute("alt", mockPhoto.title);
    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
  });

  it("renders as a link to the photo details page", () => {
    renderPhotoCard();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/photos/${mockPhoto.id}`);
  });

  it("handles long photo titles gracefully", () => {
    const longTitlePhoto: Photo = {
      ...mockPhoto,
      title:
        "This is a very long photo title that should be truncated or handled properly in the UI",
    };

    renderPhotoCard(longTitlePhoto);

    const title = screen.getByText(longTitlePhoto.title);
    expect(title).toBeInTheDocument();
    // The parent element should have a class that handles text overflow
    expect(title.parentElement).toHaveClass("line-clamp-2");
  });

  it("shows loading state while image is loading", () => {
    renderPhotoCard();

    const image = screen.getByRole("img");
    // Before the image loads, it should have a placeholder background
    expect(image.parentElement).toHaveClass("bg-muted");
  });

  it("maintains aspect ratio for consistency", () => {
    renderPhotoCard();

    // The container should have a fixed aspect ratio
    const container = screen.getByRole("img").parentElement;
    expect(container).toHaveClass("aspect-square");
  });
});
