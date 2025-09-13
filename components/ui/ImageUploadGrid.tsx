"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, GripVertical, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageItem {
  id: string;
  file: File;
  url: string;
  order: number;
}

interface ImageUploadGridProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  minImages?: number;
  title?: string;
  description?: string;
  acceptedTypes?: string;
  maxFileSize?: number; // in MB
}

export function ImageUploadGrid({
  images,
  onChange,
  maxImages = 10,
  minImages = 1,
  title = "Upload Images",
  description = "Add images to showcase your brand",
  acceptedTypes = "image/*",
  maxFileSize = 5,
}: ImageUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: ImageItem[] = [];
    
    files.forEach((file, index) => {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image`);
        return;
      }

      const id = `${Date.now()}-${index}`;
      const url = URL.createObjectURL(file);
      const order = images.length + newImages.length;

      newImages.push({ id, file, url, order });
    });

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));
    
    onChange(updatedImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reorderedImages = [...images];
    const draggedImage = reorderedImages[draggedIndex];
    
    // Remove dragged item
    reorderedImages.splice(draggedIndex, 1);
    
    // Insert at new position
    reorderedImages.splice(dropIndex, 0, draggedImage);
    
    // Update order values
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      order: index
    }));

    onChange(updatedImages);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {images.length}/{maxImages} images • Minimum {minImages} required
        </p>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Images
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG up to {maxFileSize}MB each
          </p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative group aspect-square border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-move hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <Image
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded p-1">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Order Indicator */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
