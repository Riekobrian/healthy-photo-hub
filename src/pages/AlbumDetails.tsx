import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import PhotoCard from "@/components/PhotoCard";
import { photosApi } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Image, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingContainer } from "@/components/ui/loading-container";
import { useAlbumDetails, useUser } from "@/hooks/use-api-queries";
import { useQuery } from "@tanstack/react-query";

const AlbumDetails = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch album details
  const {
    data: album,
    isLoading: isLoadingAlbum,
    error: albumError,
  } = useAlbumDetails(albumId!);

  // Fetch user details once we have the album
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser(album?.userId ?? "");

  // Fetch photos for the album
  const {
    data: photos = [],
    isLoading: isLoadingPhotos,
    error: photosError,
  } = useQuery({
    queryKey: ["photos", albumId],
    queryFn: () => photosApi.getByAlbumId(albumId!),
    enabled: !!albumId,
  });

  const isLoading = isLoadingAlbum || isLoadingUser || isLoadingPhotos;
  const error = albumError || userError || photosError;

  if (!albumId) {
    navigate("/home");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <NavBar />

      <main className="flex-grow container-custom py-8">
        {user && (
          <Link to={`/users/${user.id}`}>
            <Button variant="ghost" className="mb-6 flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to {user.name}'s Profile</span>
            </Button>
          </Link>
        )}

        {isLoading ? (
          <LoadingContainer message="albums" />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-red-600">
              Error loading album
            </h3>
            <p className="text-gray-500 mt-2">
              {error instanceof Error
                ? error.message
                : "Failed to load album information"}
            </p>
            <Button className="mt-4" onClick={() => navigate("/home")}>
              Return to Home
            </Button>
          </div>
        ) : album ? (
          <>
            {/* Album Info */}
            <Card className="mb-8">
              <CardHeader className="bg-secondary text-white">
                <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                  <Image size={24} />
                  <span>{album.title}</span>
                </CardTitle>
                {user && (
                  <div className="flex items-center gap-2 text-white/90 mt-2">
                    <UserIcon size={16} />
                    <span>Created by {user.name}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  This album contains {photos.length} photos
                </p>
              </CardContent>
            </Card>

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-xl font-medium text-gray-600">
                  No photos in this album
                </h3>
                <p className="text-gray-500 mt-2">
                  This album is currently empty.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600">
              Album not found
            </h3>
            <p className="text-gray-500 mt-2">
              The album you're looking for doesn't exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => navigate("/home")}>
              Return to Home
            </Button>
          </div>
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

export default AlbumDetails;
