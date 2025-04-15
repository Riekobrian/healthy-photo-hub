import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { Photo } from "@/services/api";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  return (
    <Link to={`/photos/${photo.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardContent className="p-4">
          <ImageWithSkeleton
            src={photo.thumbnailUrl}
            alt={photo.title}
            className="w-full aspect-square object-cover rounded-md"
          />
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-600 line-clamp-2">{photo.title}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PhotoCard;
