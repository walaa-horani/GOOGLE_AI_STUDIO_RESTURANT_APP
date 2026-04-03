import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface FirebaseImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storagePath: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
}

export default function FirebaseImage({ storagePath, fallbackSrc, alt, className, ...props }: FirebaseImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageRef = ref(storage, storagePath);
        const url = await getDownloadURL(imageRef);
        setSrc(url);
      } catch (error) {
        // If image doesn't exist in Firebase Storage yet or there's a permission error,
        // it will silently fall back to the provided Unsplash image.
        console.log(`Using fallback for ${storagePath}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [storagePath]);

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`} 
      referrerPolicy="no-referrer"
      {...props} 
    />
  );
}
