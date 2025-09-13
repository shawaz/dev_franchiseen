"use client";

import React, { useState, useRef } from 'react';
import { Plus, X, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProductService {
  id: string;
  name: string;
  description: string;
  photo: File | null;
  photoUrl: string;
  baseCost: number;
  margin: number;
  sellingPrice: number;
}

interface ProductServiceFormProps {
  products: ProductService[];
  onChange: (products: ProductService[]) => void;
  minProducts?: number;
  title?: string;
  description?: string;
}

export function ProductServiceForm({
  products,
  onChange,
  minProducts = 3,
  title = "Products & Services",
  description = "Add your key products or services to showcase to potential franchisees",
}: ProductServiceFormProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const createNewProduct = (): ProductService => ({
    id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    description: '',
    photo: null,
    photoUrl: '',
    baseCost: 0,
    margin: 0,
    sellingPrice: 0,
  });

  const addProduct = () => {
    const newProduct = createNewProduct();
    onChange([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length <= minProducts) {
      toast.error(`Minimum ${minProducts} products/services required`);
      return;
    }

    const productToRemove = products.find(p => p.id === id);
    if (productToRemove?.photoUrl) {
      URL.revokeObjectURL(productToRemove.photoUrl);
    }

    onChange(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductService, value: any) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };

        // Debug logging
        console.log('ProductServiceForm: Updating product', { id, field, value, updatedProduct });

        // Auto-calculate selling price when base cost or margin changes
        if (field === 'baseCost' || field === 'margin') {
          const baseCost = field === 'baseCost' ? value : product.baseCost;
          const margin = field === 'margin' ? value : product.margin;
          updatedProduct.sellingPrice = baseCost + (baseCost * margin / 100);
        }
        
        return updatedProduct;
      }
      return product;
    });

    console.log('ProductServiceForm: Calling onChange with', updatedProducts.length, 'products');
    onChange(updatedProducts);
  };

  const handlePhotoChange = (productId: string, file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Clean up old URL if exists
      const existingProduct = products.find(p => p.id === productId);
      if (existingProduct?.photoUrl) {
        URL.revokeObjectURL(existingProduct.photoUrl);
      }

      const photoUrl = URL.createObjectURL(file);

      // Update both photo and photoUrl in a single operation
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          const updatedProduct = { ...product, photo: file, photoUrl };
          console.log('ProductServiceForm: Updated product with photo', { id: productId, hasPhoto: !!file, photoUrl });
          return updatedProduct;
        }
        return product;
      });

      console.log('ProductServiceForm: Calling onChange after photo upload');
      onChange(updatedProducts);
    } else {
      // Remove photo
      const existingProduct = products.find(p => p.id === productId);
      if (existingProduct?.photoUrl) {
        URL.revokeObjectURL(existingProduct.photoUrl);
      }

      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          const updatedProduct = { ...product, photo: null, photoUrl: '' };
          console.log('ProductServiceForm: Removed photo from product', { id: productId });
          return updatedProduct;
        }
        return product;
      });

      console.log('ProductServiceForm: Calling onChange after photo removal');
      onChange(updatedProducts);
    }
  };

  // Initialize with minimum products if empty
  React.useEffect(() => {
    if (products.length === 0) {
      const initialProducts = Array.from({ length: minProducts }, () => createNewProduct());
      onChange(initialProducts);
    }
  }, [products.length, minProducts, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {products.length} products/services • Minimum {minProducts} required
        </p>
      </div>

      <div className="space-y-6">
        {products.map((product, index) => (
          <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                Product/Service #{index + 1}
              </h4>
              {products.length > minProducts && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Desktop Layout: Large Image on left, form on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Large Image Upload Section */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Photo <span className="text-red-500">*</span>
                </label>

                {/* Large Image Upload Area */}
                <div className="relative">
                  <input
                    ref={(el) => { fileInputRefs.current[product.id] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(product.id, e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id={`photo-${product.id}`}
                  />

                  {product.photoUrl ? (
                    <div className="relative group">
                      <Image
                        src={product.photoUrl}
                        alt={`Product ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 lg:h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoChange(product.id, null);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 lg:h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Click to upload<br />product image
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields Section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product/Service Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    placeholder="Enter product or service name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary p-3 resize-none"
                    placeholder="Describe the product or service..."
                    required
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Cost <span className="text-red-500">*</span>
                    </label>
                    <CurrencyInput
                      value={product.baseCost}
                      onChange={(value) => updateProduct(product.id, 'baseCost', value)}
                      placeholder="Enter base cost"
                      required
                      showUSDTConversion={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Margin (%) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={product.margin || ''}
                      onChange={(e) => updateProduct(product.id, 'margin', Number(e.target.value) || 0)}
                      placeholder="Enter margin %"
                      min={0}
                      max={1000}
                      step={0.1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={product.sellingPrice.toFixed(2)}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {/* Currency symbol would go here */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addProduct}
        className="w-full border-dashed border-2 hover:border-solid"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Product/Service
      </Button>
    </div>
  );
}
