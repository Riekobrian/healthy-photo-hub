import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import UserCard from '@/components/UserCard';
import { usersApi, albumsApi, User, Album } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";

const Home = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch users and albums
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersData, albumsData] = await Promise.all([
          usersApi.getAll(),
          albumsApi.getAll()
        ]);
        
        setUsers(usersData);
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load users and albums.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  // Get album count for each user
  const getUserAlbumCount = (userId: number) => {
    return albums.filter(album => album.userId === userId).length;
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <NavBar />
      
      <main className="flex-grow container-custom py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to HealthyCare</h1>
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
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-600">No users found</h3>
                <p className="text-gray-500 mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map(user => (
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
            &copy; 2025 HealthyCare App - Savannah Informatics Frontend Assessment
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
