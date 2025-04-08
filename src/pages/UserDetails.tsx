import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import AlbumCard from '@/components/AlbumCard';
import { usersApi, albumsApi, photosApi, User, Album, Photo } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mail, Globe, Phone, MapPin, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Record<number, Photo[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!userId) {
      navigate('/home');
      return;
    }

    // Fetch user details and albums
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userData = await usersApi.getById(userId);
        const userAlbums = await albumsApi.getByUserId(userId);
        
        setUser(userData);
        setAlbums(userAlbums);
        
        // Fetch photos for each album
        const photosByAlbum: Record<number, Photo[]> = {};
        
        await Promise.all(
          userAlbums.map(async (album) => {
            try {
              const albumPhotos = await photosApi.getByAlbumId(album.id);
              photosByAlbum[album.id] = albumPhotos;
            } catch (error) {
              console.error(`Error fetching photos for album ${album.id}:`, error);
            }
          })
        );
        
        setPhotos(photosByAlbum);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, isAuthenticated, navigate]);

  // Get photo count for each album
  const getAlbumPhotoCount = (albumId: number) => {
    return photos[albumId]?.length || 0;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <NavBar />
      
      <main className="flex-grow container-custom py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-6 flex items-center gap-1">
            <ArrowLeft size={16} />
            <span>Back to Users</span>
          </Button>
        </Link>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        ) : user ? (
          <>
            {/* User Profile */}
            <Card className="mb-8">
              <CardHeader className="bg-primary text-white py-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="h-24 w-24 bg-white text-primary">
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl">{user.name}</CardTitle>
                    <p className="text-primary-foreground opacity-90">@{user.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-500" size={18} />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-gray-500" size={18} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="text-gray-500" size={18} />
                        <span>{user.website}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {user.address && (
                    <>
                      <h3 className="text-lg font-medium mb-3">Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="text-gray-500 mt-1" size={18} />
                        <div>
                          <p>{user.address.street}, {user.address.suite}</p>
                          <p>{user.address.city}, {user.address.zipcode}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {user.company && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Company</h3>
                      <div className="flex items-start gap-2">
                        <Building className="text-gray-500 mt-1" size={18} />
                        <div>
                          <p className="font-medium">{user.company.name}</p>
                          <p className="text-sm text-gray-600">{user.company.catchPhrase}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Albums Section */}
            <h2 className="text-2xl font-bold mb-4">Albums ({albums.length})</h2>
            
            {albums.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">This user doesn't have any albums yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {albums.map(album => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    photoCount={getAlbumPhotoCount(album.id)} 
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600">User not found</h3>
            <p className="text-gray-500 mt-2">The user you're looking for doesn't exist or has been removed.</p>
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

export default UserDetails;
