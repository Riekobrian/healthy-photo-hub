import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { ArrowLeft, User as UserIcon, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LoadingContainer } from "@/components/ui/loading-container";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "@/services/api";
import { useAlbumDetails, useUser } from "@/hooks/use-api-queries";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PhotoDetails = () => {
  const { photoId } = useParams<{ photoId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState("");

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch photo details
  const {
    data: photo,
    isLoading: isLoadingPhoto,
    error: photoError,
  } = useQuery({
    queryKey: ["photo", photoId],
    queryFn: () => photosApi.getById(photoId!),
    enabled: !!photoId,
  });

  // Initialize edited title when photo loads
  React.useEffect(() => {
    if (photo) {
      setEditedTitle(photo.title);
    }
  }, [photo]);

  // Update photo title mutation
  const updatePhotoTitle = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      photosApi.updateTitle(id, title),
    onSuccess: (updatedPhoto) => {
      // Update the cache for the individual photo
      queryClient.setQueryData(["photo", photoId], updatedPhoto);

      // Update the album photos query
      if (photo?.albumId) {
        queryClient.invalidateQueries({
          queryKey: ["photos", photo.albumId.toString()],
        });
      }

      // Update any user's photos queries that might contain this photo
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "photos" && query.queryKey[1] === "byAlbums",
      });

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Photo title has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update photo title. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch album details once we have the photo
  const {
    data: album,
    isLoading: isLoadingAlbum,
    error: albumError,
  } = useAlbumDetails(photo?.albumId ?? "");

  // Fetch user details once we have the album
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser(album?.userId ?? "");

  const isLoading = isLoadingPhoto || isLoadingAlbum || isLoadingUser;
  const error = photoError || albumError || userError;

  const handleTitleUpdate = () => {
    if (!photo || !editedTitle.trim()) return;
    updatePhotoTitle.mutate({ id: photo.id, title: editedTitle.trim() });
  };

  const handleCancelEdit = () => {
    setEditedTitle(photo?.title ?? "");
    setIsEditing(false);
  };

  if (!photoId) {
    navigate("/home");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <NavBar />

      <main className="flex-grow container-custom py-8">
        {album && (
          <Link to={`/albums/${album.id}`}>
            <Button variant="ghost" className="mb-6 flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to Album</span>
            </Button>
          </Link>
        )}

        {isLoading ? (
          <LoadingContainer message="photos" />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-red-600">
              Error loading photo
            </h3>
            <p className="text-gray-500 mt-2">
              {error instanceof Error
                ? error.message
                : "Failed to load photo information"}
            </p>
            <Button className="mt-4" onClick={() => navigate("/home")}>
              Return to Home
            </Button>
          </div>
        ) : photo ? (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="relative p-0">
                <div className="relative">
                  <ImageWithSkeleton
                    src={photo.url}
                    alt={photo.title}
                    className="w-full rounded-t-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                          placeholder="Enter photo title..."
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/80 hover:text-white hover:bg-white/20"
                          onClick={handleTitleUpdate}
                          disabled={!editedTitle.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/80 hover:text-white hover:bg-white/20"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-white flex items-center justify-between">
                          {photo.title}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/20"
                            onClick={() => setIsEditing(true)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                        {user && (
                          <div className="flex items-center gap-2 text-white/90">
                            <UserIcon size={16} />
                            <span>From {user.name}'s album</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <ImageWithSkeleton
                    src={photo.url}
                    alt={photo.title}
                    className="absolute inset-0 w-full h-full object-contain bg-black/5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Album Navigation */}
            {album && (
              <div className="mt-6 flex justify-between items-center">
                <Link to={`/albums/${album.id}`}>
                  <Button variant="outline">View Album</Button>
                </Link>
                {user && (
                  <Link to={`/users/${user.id}`}>
                    <Button variant="outline">View User Profile</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600">
              Photo not found
            </h3>
            <p className="text-gray-500 mt-2">
              The photo you're looking for doesn't exist or has been removed.
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

export default PhotoDetails;
