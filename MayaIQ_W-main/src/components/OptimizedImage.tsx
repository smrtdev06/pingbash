import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallbackSrc = '/images/placeholder.png',
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+i+9HpYz+1H9q3NZGRJJCIUBHSKlkJBBBBB6g9CCjXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6iXhpgCBFhABgANgAOgHQAD+6"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Image unavailable
        </div>
      )}
    </div>
  );
};

// Avatar component with optimized loading
export const OptimizedAvatar: React.FC<{
  src?: string;
  name: string;
  size?: number;
  className?: string;
}> = ({ src, name, size = 40, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];
  
  const colorIndex = name.length % bgColors.length;

  if (!src || imageError) {
    return (
      <div 
        className={`${bgColors[colorIndex]} text-white rounded-full flex items-center justify-center font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}; 