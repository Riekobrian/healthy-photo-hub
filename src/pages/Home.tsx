import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import UserCard from "@/components/UserCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useUsers } from "@/hooks/use-api-queries";

export default function Home() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Photo Albums</h1>
        {isLoadingUsers ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users?.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
