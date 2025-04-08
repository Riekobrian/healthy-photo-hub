
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Briefcase, Phone } from 'lucide-react';
import { User as UserType } from '@/services/api';

interface UserCardProps {
  user: UserType;
  albumCount?: number;
}

const UserCard: React.FC<UserCardProps> = ({ user, albumCount }) => {
  return (
    <Link to={`/users/${user.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader className="bg-primary text-white pb-2">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <User size={20} />
            <span>{user.name}</span>
          </CardTitle>
          <p className="text-sm opacity-90">@{user.username}</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail size={16} className="text-gray-500" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone size={16} className="text-gray-500" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center space-x-2 text-sm">
                <Briefcase size={16} className="text-gray-500" />
                <span>{user.company.name}</span>
              </div>
            )}
          </div>
        </CardContent>
        {albumCount !== undefined && (
          <CardFooter className="bg-muted py-2">
            <p className="text-sm text-gray-600 w-full text-center">
              {albumCount} {albumCount === 1 ? 'Album' : 'Albums'}
            </p>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};

export default UserCard;
