
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Album, Image } from 'lucide-react';
import { Album as AlbumType } from '@/services/api';

interface AlbumCardProps {
  album: AlbumType;
  photoCount?: number;
  userName?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, photoCount, userName }) => {
  return (
    <Link to={`/albums/${album.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-4 border-t-secondary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Album size={20} className="text-secondary" />
            <span className="line-clamp-1">{album.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {userName && (
            <p className="text-sm text-gray-600">By: {userName}</p>
          )}
        </CardContent>
        {photoCount !== undefined && (
          <CardFooter className="bg-muted py-2">
            <div className="flex items-center justify-center space-x-2 w-full text-sm text-gray-600">
              <Image size={16} />
              <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};

export default AlbumCard;
