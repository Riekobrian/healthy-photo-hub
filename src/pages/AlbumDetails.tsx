import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import PhotoCard from '@/components/PhotoCard';
import { albumsApi, photosApi, usersApi, Album, Photo, User } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowLeft, Image, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const AlbumDetails = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!albumId) {
      navigate('/home');
      return;
    }

    // Fetch album details and photos
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const albumData = await albumsApi.getById(albumId);
        const photosData = await photosApi.getByAlbumId(albumId);
        
        setAlbum(albumData);
        setPhotos(photosData);
        
        // Get user info
        if (albumData.userId) {
          const userData = await usersApi.getById(albumData.userId);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
        toast.error('Failed to load album information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [albumId, isAuthenticated, navigate]);

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
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading album details...</span>
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
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon size={18} />
                  {user ? (
                    <Link to={`/users/${user.id}`} className="hover:text-primary hover:underline">
                      Created by {user.name}
                    </Link>
                  ) : (
                    <span>Unknown creator</span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-gray-600">This album contains {photos.length} photos</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Photos Section */}
            <h2 className="text-2xl font-bold mb-4">Photos ({photos.length})</h2>
            
            {photos.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">This album doesn't have any photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600">Album not found</h3>
            <p className="text-gray-500 mt-2">The album you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => navigate('/home')}>
              Return to Home
            </Button>
          </div>
        )}
      </main>
      
      <footer className="bg-white shadow-md mt-auto">
        <div className="container-custom py-4">
          <p className="text-center text-gray-600 text-sm">
            &copy; 2025 HealthyCare App - Savannah Informatics Frontend Assessment
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AlbumDetails;
