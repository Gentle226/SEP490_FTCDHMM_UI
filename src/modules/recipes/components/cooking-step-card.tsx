'use client';

import { GripVertical, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/base/components/ui/card';
import { Textarea } from '@/base/components/ui/textarea';

import { CookingStep, CookingStepImage } from '../types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface CookingStepCardProps {
  step: CookingStep;
  index: number;
  _isDragging?: boolean;
  isDragOver: boolean;
  canRemove: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onUpdateInstruction: (instruction: string) => void;
  onAddImage: (files: File[]) => void;
  onRemoveImage: (imageIndex: number) => void;
  onReorderImages: (images: CookingStepImage[]) => void;
  onRemoveStep: () => void;
}

export function CookingStepCard({
  step,
  index,
  isDragOver,
  canRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdateInstruction,
  onAddImage,
  onRemoveImage,
  onReorderImages,
  onRemoveStep,
}: CookingStepCardProps) {
  const [focusedStepIndex, setFocusedStepIndex] = useState<number | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

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

  const getImageUrl = (img: CookingStepImage): string | null => {
    if (img.image instanceof File) {
      return URL.createObjectURL(img.image);
    }
    return img.imageUrl || (typeof img.image === 'string' ? img.image : null);
  };

  return (
    <Card
      className={`relative cursor-move transition-all ${isDragOver ? 'border-green-500 bg-green-50' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-3">
          {/* Left Column: Step Number and Drag Handle */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#99b94a] text-2xl font-semibold text-white">
              {step.stepOrder}
            </div>
            <div className="cursor-grab text-gray-400 active:cursor-grabbing">
              <GripVertical className="h-5 w-5" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="min-w-0 space-y-1">
              <Textarea
                placeholder="Ướp cá hồi với mật ong, dầu oliu và tiêu 15 phút."
                value={step.instruction}
                onChange={(e) => onUpdateInstruction(e.target.value.slice(0, 1000))}
                onFocus={() => setFocusedStepIndex(index)}
                onBlur={() => setFocusedStepIndex(null)}
                maxLength={1000}
                rows={3}
                className="w-full break-words"
              />
              <p
                className={`text-right text-xs transition-opacity ${focusedStepIndex === index ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
              >
                {step.instruction.length}/1000
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-600">
                Hình ảnh ({step.images?.length || 0}/5)
              </p>
              <div className="flex flex-wrap gap-2">
                {step.images && step.images.length > 0
                  ? step.images.map((img, imgIndex) => {
                      const imgUrl = getImageUrl(img);

                      return (
                        <div
                          key={img.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedImageIndex(imgIndex);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImageIndex !== null && draggedImageIndex !== imgIndex) {
                              const newImages = [...step.images!];
                              const [draggedImg] = newImages.splice(draggedImageIndex, 1);
                              newImages.splice(imgIndex, 0, draggedImg);
                              // Update imageOrder for all images
                              newImages.forEach((img, idx) => {
                                img.imageOrder = idx + 1;
                              });
                              onReorderImages(newImages);
                              setDraggedImageIndex(null);
                            }
                          }}
                          onDragEnd={() => setDraggedImageIndex(null)}
                          className={`relative h-20 w-20 cursor-move overflow-hidden rounded-lg border-2 transition-all ${
                            draggedImageIndex === imgIndex
                              ? 'border-blue-500 opacity-50'
                              : 'border-gray-200'
                          }`}
                        >
                          {imgUrl && (
                            <Image
                              src={imgUrl}
                              alt={`Step ${step.stepOrder} Image ${imgIndex + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveImage(imgIndex)}
                            className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-red-500 p-0.5 text-white hover:bg-red-600"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="bg-opacity-50 absolute right-0 bottom-0 left-0 bg-black px-1 py-0.5 text-center text-xs font-medium text-white">
                            {imgIndex + 1}
                          </div>
                        </div>
                      );
                    })
                  : null}

                {(!step.images || step.images.length < 5) && (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
                    <Upload className="h-4 w-4 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const validFiles: File[] = [];
                          for (const file of files) {
                            const error = validateImageFile(file);
                            if (error) {
                              toast.error(error);
                            } else {
                              validFiles.push(file);
                            }
                          }
                          if (validFiles.length > 0) {
                            onAddImage(validFiles);
                          }
                        }
                      }}
                      aria-label={`Upload images for step ${step.stepOrder}`}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {canRemove && (
          <div className="absolute right-3 bottom-3">
            <button
              type="button"
              onClick={onRemoveStep}
              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
              aria-label={`Remove step ${step.stepOrder}`}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
