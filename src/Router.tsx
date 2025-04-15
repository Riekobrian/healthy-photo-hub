import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import UserDetails from "@/pages/UserDetails";
import AlbumDetails from "@/pages/AlbumDetails";
import PhotoDetails from "@/pages/PhotoDetails";
import NotFound from "@/pages/NotFound";
import CallbackHandler from "@/pages/CallbackHandler";
import { useAuth } from "@/hooks/use-auth";

export const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/users/:userId" element={<UserDetails />} />
      <Route path="/albums/:albumId" element={<AlbumDetails />} />
      <Route path="/photos/:photoId" element={<PhotoDetails />} />
      <Route path="/callback" element={<CallbackHandler />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
