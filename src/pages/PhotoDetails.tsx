import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { photosApi, albumsApi, Photo, Album } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowLeft, Save, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from "sonner";

const PhotoDetails = () => {
  const { photoId } = useParams<{ photoId: string }>();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!photoId) {
      navigate('/home');
      return;
    }

    // Fetch photo details
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const photoData = await photosApi.getById(photoId);
        setPhoto(photoData);
        setEditedTitle(photoData.title);
        
        // Get album info
        if (photoData.albumId) {
          const albumData = await albumsApi.getById(photoData.albumId);
          setAlbum(albumData);
        }
      } catch (error) {
        console.error('Error fetching photo data:', error);
        toast.error('Failed to load photo information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [photoId, isAuthenticated, navigate]);

  const handleSaveTitle = async () => {
    if (!photo || !editedTitle.trim()) return;
    
    setIsSaving(true);
    try {
      const updatedPhoto = await photosApi.updateTitle(photo.id, editedTitle);
      setPhoto(updatedPhoto);
      setIsEditing(false);
      toast.success('Photo title updated successfully!');
    } catch (error) {
      console.error('Error updating photo title:', error);
      toast.error('Failed to update photo title.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditedTitle(photo?.title || '');
    setIsEditing(false);
  };

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
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading photo details...</span>
          </div>
        ) : photo ? (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              {/* Photo */}
              <div className="bg-gray-100">
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-auto object-contain"
                />
              </div>
              
              {/* Title */}
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-2">
                    <label htmlFor="photoTitle" className="text-sm font-medium text-gray-700">
                      Edit Photo Title
                    </label>
                    <Input
                      id="photoTitle"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Enter photo title"
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <h1 className="text-xl font-semibold">{photo.title}</h1>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsEditing(true)} 
                      className="ml-2"
                    >
                      <Edit size={18} />
                    </Button>
                  </div>
                )}
                
                {album && (
                  <p className="mt-2 text-gray-600">
                    From album:{' '}
                    <Link to={`/albums/${album.id}`} className="text-primary hover:underline">
                      {album.title}
                    </Link>
                  </p>
                )}
              </CardContent>
              
              {/* Action Buttons */}
              {isEditing && (
                <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTitle}
                    disabled={!editedTitle.trim() || isSaving}
                    className="bg-primary flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600">Photo not found</h3>
            <p className="text-gray-500 mt-2">The photo you're looking for doesn't exist or has been removed.</p>
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

export default PhotoDetails;
