"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/server/actions";
import PleaseWait from "../loader/PleaseWait";
import showToast from "@/utils/showToast";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  initialUrl?: string;
}

export default function ImageUploader({ 
  onImageUploaded, 
  initialUrl 
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!!initialUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Set the image when initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setImage(initialUrl);
      setImageLoaded(true);
    }
  }, [initialUrl]);

  const triggerFileInput = () => {
    if (uploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setImageLoaded(false);
    
    try {
      const result = await uploadImage(formData);
      if (result.success && result.image) {
        setImage(result.image.secure_url);
        onImageUploaded(result.image.secure_url);
        showToast("Image uploaded successfully", "success");
      }
    } catch (error) {
      console.error("Upload failed", error);
      showToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative py-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={triggerFileInput}
        className={`border-4 border-primary-200 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer relative ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ minHeight: '240px', width: '100%' }}
      >
        {uploading && <PleaseWait />}
        
        {image ? (
          <div className="relative w-full h-full min-h-[240px]">
            <Image
              src={image}
              alt="Uploaded image"
              fill
              style={{ objectFit: 'cover' }}
              onLoad={() => setImageLoaded(true)}
              className={imageLoaded ? 'opacity-100' : 'opacity-0'}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!imageLoaded && !uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse w-12 h-12 rounded-full bg-gray-200"></div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200">
              <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                Click to change image
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 p-4 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-2 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p>Click to upload an image</p>
          </div>
        )}
      </div>
    </div>
  );
}