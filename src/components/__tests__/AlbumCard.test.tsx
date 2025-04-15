import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import AlbumCard from "../AlbumCard";
import type { Album } from "../../services/api";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

interface AlbumCardProps {
  album: Album;
  photoCount?: number;
  userName?: string;
}

const mockAlbum: Album = {
  id: 1,
  userId: 1,
  title: "Test Album",
};

const renderAlbumCard = (props: Partial<AlbumCardProps> = {}) => {
  const defaultProps: AlbumCardProps = {
    album: mockAlbum,
  };
  const mergedProps = { ...defaultProps, ...props };
  return render(
    <MemoryRouter>
      <AlbumCard {...mergedProps} />
    </MemoryRouter>
  );
};

describe("AlbumCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders album title", () => {
    renderAlbumCard();
    expect(screen.getByText(mockAlbum.title)).toBeInTheDocument();
  });

  it("navigates to album details when clicked", () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderAlbumCard();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/albums/${mockAlbum.id}`);
  });

  it("shows photo count when provided", () => {
    renderAlbumCard({ photoCount: 5 });
    expect(screen.getByText("5 Photos")).toBeInTheDocument();
  });

  it("renders singular photo text when count is 1", () => {
    renderAlbumCard({ photoCount: 1 });
    expect(screen.getByText("1 Photo")).toBeInTheDocument();
  });

  it("renders user name when provided", () => {
    renderAlbumCard({ userName: "John Doe" });
    expect(screen.getByText("By: John Doe")).toBeInTheDocument();
  });

  it("does not render user name when not provided", () => {
    renderAlbumCard();
    expect(screen.queryByText(/By:/)).not.toBeInTheDocument();
  });
});

describe("AlbumCard Edge Cases", () => {
  it("handles empty title", () => {
    renderAlbumCard({ album: { ...mockAlbum, title: "" } });
    const card = screen.getByRole("link");
    expect(card).toBeInTheDocument();
  });

  it("handles very long titles", () => {
    const longTitle = "A".repeat(100);
    renderAlbumCard({ album: { ...mockAlbum, title: longTitle } });
    const titleElement = screen.getByText(/A+/);
    expect(titleElement.textContent!.length).toBeLessThan(longTitle.length);
  });

  it("handles zero photo count", () => {
    renderAlbumCard({ photoCount: 0 });
    expect(screen.getByText("0 Photos")).toBeInTheDocument();
  });

  it("renders correctly without optional props", () => {
    renderAlbumCard();
    expect(screen.queryByText(/By:/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("photo-count")).not.toBeInTheDocument();
  });
});
