"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface FranchiseImage {
  src: string;
  alt: string;
}

interface FranchiseImageGalleryProps {
  images?: string[] | FranchiseImage[];
  brandName?: string;
  franchiseName?: string;
}

const defaultImages: FranchiseImage[] = [
  {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Modern restaurant exterior with large windows"
  },
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Elegant dining area with warm lighting"
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Professional kitchen with modern equipment"
  },
  {
    src: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Cozy seating area with comfortable furniture"
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Outdoor terrace dining space"
  },
  {
    src: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Bar area with premium beverages"
  },
  {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Private dining room for events"
  },
  {
    src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Street view showing prime location"
  },
  {
    src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Food preparation and presentation area"
  },
  {
    src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    alt: "Reception and waiting area"
  }
];

export default function FranchiseImageGallery({
  images = defaultImages,
  brandName = "Brand",
  franchiseName = "Franchise"
}: FranchiseImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Convert images to consistent format and filter out invalid URLs
  const processedImages: FranchiseImage[] = images
    .filter((image) => {
      // Filter out blob URLs and empty strings
      if (typeof image === 'string') {
        return image && !image.startsWith('blob:') && image.trim() !== '';
      }
      return image && image.src && !image.src.startsWith('blob:') && image.src.trim() !== '';
    })
    .map((image, index) => {
      if (typeof image === 'string') {
        return {
          src: image,
          alt: `${brandName} - ${franchiseName} Image ${index + 1}`
        };
      }
      return image;
    });

  // Use processed images or default if empty
  const displayImages = processedImages.length > 0 ? processedImages : defaultImages;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div className="relative">
      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden m-6">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 relative">
            <Image
              src={displayImages[0]?.src || defaultImages[0].src}
              alt={displayImages[0]?.alt || defaultImages[0].alt}
              fill
              className="object-cover hover:brightness-110 transition-all duration-300 cursor-pointer rounded-l-xl"
            />
          </div>

          {/* Top right images */}
          <div className="relative">
            <Image
              src={displayImages[1]?.src || defaultImages[1].src}
              alt={displayImages[1]?.alt || defaultImages[1].alt}
              fill
              className="object-cover hover:brightness-110 transition-all duration-300 cursor-pointer"
            />
          </div>
          <div className="relative">
            <Image
              src={displayImages[2]?.src || defaultImages[2].src}
              alt={displayImages[2]?.alt || defaultImages[2].alt}
              fill
              className="object-cover hover:brightness-110 transition-all duration-300 cursor-pointer rounded-tr-xl"
            />
          </div>

          {/* Bottom right images */}
          <div className="relative">
            <Image
              src={displayImages[3]?.src || defaultImages[3].src}
              alt={displayImages[3]?.alt || defaultImages[3].alt}
              fill
              className="object-cover hover:brightness-110 transition-all duration-300 cursor-pointer"
            />
          </div>
          <div className="relative">
            <Image
              src={displayImages[4]?.src || defaultImages[4].src}
              alt={displayImages[4]?.alt || defaultImages[4].alt}
              fill
              className="object-cover hover:brightness-110 transition-all duration-300 cursor-pointer rounded-br-xl"
            />
            {/* Show all photos button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-br-xl">
              <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slider View */}
      <div className="md:hidden">
        <div 
          className="relative h-[300px] overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {displayImages.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Show all photos button for mobile */}
          <div className="absolute top-4 right-4">
            <button className="bg-white/90 text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
              {images.length}
            </button>
          </div>

          {/* Image counter */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );
}
