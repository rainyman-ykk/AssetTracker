import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";

interface UseAssetsOptions {
  search?: string;
  category?: string;
  sort?: string;
}

export function useAssets(options: UseAssetsOptions = {}) {
  const { search, category, sort } = options;
  
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (category && category !== 'all') queryParams.append('category', category);
  if (sort) queryParams.append('sort', sort);
  
  const queryString = queryParams.toString();
  const url = `/api/assets${queryString ? `?${queryString}` : ''}`;

  return useQuery<Asset[]>({
    queryKey: ['/api/assets', search, category, sort],
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return response.json();
    },
  });
}
