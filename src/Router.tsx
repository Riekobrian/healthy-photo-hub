import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import UserDetails from "@/pages/UserDetails";
import AlbumDetails from "@/pages/AlbumDetails";
import PhotoDetails from "@/pages/PhotoDetails";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/hooks/use-auth";
import { PrivateRoute } from "@/components/PrivateRoute";

export const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <PrivateRoute>
            <UserDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/albums/:albumId"
        element={
          <PrivateRoute>
            <AlbumDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/photos/:photoId"
        element={
          <PrivateRoute>
            <PhotoDetails />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
