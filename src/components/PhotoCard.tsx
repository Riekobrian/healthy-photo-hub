
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Photo as PhotoType } from '@/services/api';

interface PhotoCardProps {
  photo: PhotoType;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  return (
    <Link to={`/photos/${photo.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={photo.thumbnailUrl} 
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardFooter className="p-3">
          <p className="text-sm line-clamp-2 text-center w-full">{photo.title}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PhotoCard;
