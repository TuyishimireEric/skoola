"use client";

import { useUnsplashImage } from "@/hooks/unsplashImage/useUnsplashImage";
import Image from "next/image";
import { useEffect, useState } from "react";
import Loading from "../loader/Loading";

interface UnsplashImageProps {
  imageKey: string;
}

export default function UnsplashImage({ imageKey }: UnsplashImageProps) {
  const {
    data: image,
    isLoading,
    isError,
  } = useUnsplashImage(imageKey);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      const imageUrl =
        image?.photos[0].src.medium || image?.photos[0].src.small;
      setImageUrl(imageUrl);
    }
  }, [image]);

  if (isLoading) return <Loading overlay={true} fullScreen={false} />;
  if (isError || !image) return <p></p>;
  if (!imageUrl) return <p>No image URL available.</p>;

  return (
    <div className="flex flex-col items-center">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={imageKey}
          className="rounded-lg shadow-md object-cover object-center"
          fill
        />
      )}
    </div>
  );
}
