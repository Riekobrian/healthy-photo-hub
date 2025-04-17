import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import UserCard from "@/components/UserCard";
import { Album } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { LoadingContainer } from "@/components/ui/loading-container";
import { useUsers, useAlbums } from "@/hooks/use-api-queries";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers();

  const {
    data: albums = [],
    isLoading: isLoadingAlbums,
    error: albumsError,
  } = useAlbums();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get album count for each user
  const getUserAlbumCount = (userId: number) => {
    return albums.filter((album: Album) => album.userId === userId).length;
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isLoadingUsers || isLoadingAlbums;
  const error = usersError || albumsError;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <NavBar />

      <main className="flex-grow container-custom py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome
            {user?.user_metadata?.full_name
              ? `, ${user.user_metadata.full_name}`
              : ""}
          </h1>
          <p className="text-gray-600">
            Browse through our users and explore their health albums.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingContainer message="users" />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-red-600">
              Error loading data
            </h3>
            <p className="text-gray-500 mt-2">
              {error instanceof Error
                ? error.message
                : "An error occurred while loading the data"}
            </p>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-600">
                  No users found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    albumCount={getUserAlbumCount(user.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white shadow-md mt-auto">
        <div className="container-custom py-4">
          <p className="text-center text-gray-600 text-sm">
            &copy; 2025 HealthyCare App - Savannah Informatics Frontend
            Assessment
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
