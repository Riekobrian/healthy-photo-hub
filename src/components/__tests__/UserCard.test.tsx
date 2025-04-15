import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserCard from "../UserCard";
import type { User } from "../../services/api";

const mockUser: User = {
  id: 1,
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  phone: "123-456-7890",
  company: {
    name: "Test Company",
    catchPhrase: "Test Catchphrase",
    bs: "Test BS",
  },
};

const renderUserCard = (props: Partial<User> = {}, albumCount?: number) => {
  const user = { ...mockUser, ...props };
  return render(
    <MemoryRouter>
      <UserCard user={user} albumCount={albumCount} />
    </MemoryRouter>
  );
};

describe("UserCard Component", () => {
  it("renders basic user information", () => {
    renderUserCard();

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("renders optional phone number when provided", () => {
    renderUserCard();
    expect(screen.getByText(mockUser.phone!)).toBeInTheDocument();
  });

  it("does not render phone number when not provided", () => {
    const userWithoutPhone = { ...mockUser, phone: undefined };
    renderUserCard(userWithoutPhone);
    expect(screen.queryByText(/\d{3}-\d{3}-\d{4}/)).not.toBeInTheDocument();
  });

  it("renders company name when provided", () => {
    renderUserCard();
    expect(screen.getByText(mockUser.company!.name)).toBeInTheDocument();
  });

  it("does not render company name when not provided", () => {
    const userWithoutCompany = { ...mockUser, company: undefined };
    renderUserCard(userWithoutCompany);
    expect(screen.queryByText(/test company/i)).not.toBeInTheDocument();
  });

  it("renders album count when provided", () => {
    renderUserCard({}, 5);
    expect(screen.getByText(/5 albums/i)).toBeInTheDocument();
  });

  it("renders singular 'Album' when count is 1", () => {
    renderUserCard({}, 1);
    expect(screen.getByText(/1 album/i)).toBeInTheDocument();
  });

  it("does not render album count when not provided", () => {
    renderUserCard();
    expect(screen.queryByText(/album/i)).not.toBeInTheDocument();
  });

  it("renders as a link to the user details page", () => {
    renderUserCard();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/users/${mockUser.id}`);
  });
});