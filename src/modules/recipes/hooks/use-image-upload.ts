'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from '@/modules/recipes/components/recipe-form/types';

export interface UseImageUploadResult {
  // State
  mainImage: File | null;
  mainImagePreview: string | null;
  isCopiedRecipe: boolean;
  isCropDialogOpen: boolean;
  imageToCrop: string | null;
  isDragOver: boolean;

  // Setters
  setMainImage: (file: File | null) => void;
  setMainImagePreview: (preview: string | null) => void;
  setIsCopiedRecipe: (value: boolean) => void;

  // Actions
  handleMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  handleCropComplete: (croppedFile: File) => void;
  handleCropCancel: () => void;
  handleRemoveImage: () => void;
  validateImageFile: (file: File) => string | null;
}

export function useImageUpload(initialPreview?: string | null): UseImageUploadResult {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialPreview || null);
  const [isCopiedRecipe, setIsCopiedRecipe] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateImageFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Chỉ hỗ trợ hình ảnh JPG, PNG và GIF. Bạn đã tải lên ${file.type}`;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    if (!fileExtension || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
      return `Định dạng tệp không hợp lệ. Vui lòng tải lên JPG, PNG hoặc GIF`;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Kích thước hình ảnh không được vượt quá 5MB. Hình ảnh hiện tại là ${sizeMB}MB`;
    }

    return null;
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      processImageFile(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setMainImage(croppedFile);
    setIsCopiedRecipe(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setIsCropDialogOpen(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setIsCropDialogOpen(false);
    setImageToCrop(null);
  };

  const handleRemoveImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
    setIsCopiedRecipe(false);
  };

  return {
    mainImage,
    mainImagePreview,
    isCopiedRecipe,
    isCropDialogOpen,
    imageToCrop,
    isDragOver,
    setMainImage,
    setMainImagePreview,
    setIsCopiedRecipe,
    handleMainImageChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCropComplete,
    handleCropCancel,
    handleRemoveImage,
    validateImageFile,
  };
}
