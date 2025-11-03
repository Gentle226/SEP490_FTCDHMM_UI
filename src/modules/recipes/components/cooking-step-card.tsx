'use client';

import { GripVertical, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { Card, CardContent } from '@/base/components/ui/card';
import { Textarea } from '@/base/components/ui/textarea';

import { CookingStep } from '../types';

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
  onAddImage: (file: File) => void;
  onRemoveImage: () => void;
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
  onRemoveStep,
}: CookingStepCardProps) {
  const [focusedStepIndex, setFocusedStepIndex] = useState<number | null>(null);

  // Memoize object URL for File images to prevent recreation on re-render
  const imageUrl = useMemo(() => {
    if (!step.image && !step.imagePreview) return null;

    if (step.image instanceof File) {
      return URL.createObjectURL(step.image);
    }
    return step.imagePreview || null;
  }, [step.image, step.imagePreview]);

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
            <div className="space-y-1">
              <Textarea
                placeholder="Ướp cá hồi với mật ong, dầu oliu và tiêu 15 phút."
                value={step.instruction}
                onChange={(e) => onUpdateInstruction(e.target.value.slice(0, 500))}
                onFocus={() => setFocusedStepIndex(index)}
                onBlur={() => setFocusedStepIndex(null)}
                maxLength={500}
                rows={3}
                className="break-words"
              />
              <p
                className={`text-right text-xs transition-opacity ${focusedStepIndex === index ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
              >
                {step.instruction.length}/500
              </p>
            </div>

            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative h-32 w-48 overflow-hidden rounded-lg border">
                  <Image
                    src={imageUrl}
                    alt={`Step ${step.stepOrder}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label="Remove step image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onAddImage(file);
                    }}
                    aria-label={`Upload image for step ${step.stepOrder}`}
                  />
                </label>
              )}
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
