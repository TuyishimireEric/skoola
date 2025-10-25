import { PexelsApiResponse } from "@/types/images";
import { useQuery } from "@tanstack/react-query";

const fetchUnsplashImage = async (
  imageKey: string
): Promise<PexelsApiResponse> => {
  const res = await fetch(`/api/ai/unsplash?query=${imageKey}`);
  if (!res.ok) throw new Error("Failed to fetch image");
  return res.json();
};

export function useUnsplashImage(imageKey: string) {
  return useQuery({
    queryKey: ["unsplashImage", imageKey],
    queryFn: () => fetchUnsplashImage(imageKey),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
