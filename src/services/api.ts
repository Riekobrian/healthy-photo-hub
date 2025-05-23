import { toast } from "sonner";
import { errorLogger, ErrorSeverity } from "./error-logging";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Album {
  id: number;
  userId: number;
  title: string;
}

export interface Photo {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

// API request helper with error handling
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: object
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorMessage = `API request failed: ${response.status}`;
      errorLogger.log(errorMessage, ErrorSeverity.ERROR, {
        endpoint,
        method,
        statusCode: response.status,
        statusText: response.statusText,
      });
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as T;
    errorLogger.log(`API request successful: ${endpoint}`, ErrorSeverity.INFO, {
      endpoint,
      method,
    });
    return data;
  } catch (error) {
    errorLogger.log(
      `API Error: ${(error as Error).message}`,
      ErrorSeverity.ERROR,
      {
        endpoint,
        method,
        error,
      },
      error
    );
    throw error;
  }
}

// Users API
export const usersApi = {
  getAll: (): Promise<User[]> => apiRequest("/users"),
  getById: (id: number | string): Promise<User> => apiRequest(`/users/${id}`),
};

// Albums API
export const albumsApi = {
  getAll: (): Promise<Album[]> => apiRequest("/albums"),
  getById: (id: number | string): Promise<Album> => apiRequest(`/albums/${id}`),
  getByUserId: (userId: number | string): Promise<Album[]> =>
    apiRequest(`/users/${userId}/albums`),
};

// Photos API
export const photosApi = {
  getAll: (): Promise<Photo[]> => apiRequest("/photos"),
  getById: (id: number | string): Promise<Photo> => apiRequest(`/photos/${id}`),
  getByAlbumId: (albumId: number | string): Promise<Photo[]> =>
    apiRequest(`/albums/${albumId}/photos`),
  updateTitle: (id: number | string, title: string): Promise<Photo> =>
    apiRequest(`/photos/${id}`, "PATCH", { title }),
};
