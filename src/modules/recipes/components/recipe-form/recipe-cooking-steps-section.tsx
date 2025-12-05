'use client';

import { Plus, Soup } from 'lucide-react';

import { Button } from '@/base/components/ui/button';
import { Label } from '@/base/components/ui/label';
import { CookingStep } from '@/modules/recipes/types';

import { CookingStepCard } from '../cooking-step-card';

interface RecipeCookingStepsSectionProps {
  cookingSteps: CookingStep[];
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, toIndex: number) => void;
  onUpdateInstruction: (index: number, instruction: string) => void;
  onAddImage: (index: number, files: File[]) => void;
  onRemoveImage: (stepIndex: number, imageIndex: number) => void;
  onReorderImages: (stepIndex: number, reorderedImages: CookingStep['images']) => void;
  onRemoveStep: (index: number) => void;
  onAddStep: () => void;
}

export function RecipeCookingStepsSection({
  cookingSteps,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdateInstruction,
  onAddImage,
  onRemoveImage,
  onReorderImages,
  onRemoveStep,
  onAddStep,
}: RecipeCookingStepsSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Soup className="h-4 w-4 text-[#99b94a]" />
        Các bước nấu
        <span className="text-red-500">*</span>
      </Label>

      {cookingSteps.map((step, index) => (
        <CookingStepCard
          key={step.id}
          step={step}
          index={index}
          isDragOver={dragOverIndex === index}
          canRemove={cookingSteps.length > 1}
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          onUpdateInstruction={(instruction) => onUpdateInstruction(index, instruction)}
          onAddImage={(files) => onAddImage(index, files)}
          onRemoveImage={(imageIndex) => onRemoveImage(index, imageIndex)}
          onReorderImages={(reorderedImages) => onReorderImages(index, reorderedImages)}
          onRemoveStep={() => onRemoveStep(index)}
        />
      ))}

      <Button type="button" onClick={onAddStep} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Bước làm
      </Button>
    </div>
  );
}
