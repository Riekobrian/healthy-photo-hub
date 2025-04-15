import { useQuery } from "@tanstack/react-query";
import { usersApi, albumsApi, User, Album } from "@/services/api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll(),
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: () => albumsApi.getAll(),
  });
}

export function useUserAlbums(userId: number | string) {
  return useQuery({
    queryKey: ["albums", userId],
    queryFn: () => albumsApi.getByUserId(userId),
    enabled: !!userId,
  });
}

export function useUser(userId: number | string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
}

export function useAlbumDetails(albumId: number | string) {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => albumsApi.getById(albumId),
    enabled: !!albumId,
  });
}
