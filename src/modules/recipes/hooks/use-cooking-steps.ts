'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { CookingStep } from '@/modules/recipes/types';

export interface UseCookingStepsResult {
  // State
  cookingSteps: CookingStep[];
  setCookingSteps: React.Dispatch<React.SetStateAction<CookingStep[]>>;
  draggedStepIndex: number | null;
  dragOverIndex: number | null;

  // Actions
  addCookingStep: () => void;
  removeCookingStep: (index: number) => void;
  updateStepDescription: (index: number, instruction: string) => void;
  handleStepImageChange: (index: number, files: File[]) => void;
  handleRemoveStepImage: (stepIndex: number, imageIndex: number) => void;
  handleReorderStepImages: (stepIndex: number, reorderedImages: CookingStep['images']) => void;

  // Drag and drop
  handleCookStepDragStart: (index: number) => void;
  handleCookStepDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleCookStepDragLeave: () => void;
  handleCookStepDrop: (e: React.DragEvent<HTMLDivElement>, toIndex: number) => void;
}

const createEmptyStep = (stepOrder: number): CookingStep => ({
  id: crypto.randomUUID(),
  stepOrder,
  instruction: '',
  images: [],
});

export function useCookingSteps(initialSteps?: CookingStep[]): UseCookingStepsResult {
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>(
    initialSteps || [createEmptyStep(1)],
  );
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addCookingStep = () => {
    setCookingSteps((prev) => [...prev, createEmptyStep(prev.length + 1)]);
  };

  const removeCookingStep = (index: number) => {
    setCookingSteps((prev) => {
      const newSteps = prev.filter((_, i) => i !== index);
      return newSteps.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }));
    });
  };

  const updateStepDescription = (index: number, instruction: string) => {
    setCookingSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index].instruction = instruction;
      return newSteps;
    });
  };

  const handleStepImageChange = (index: number, files: File[]) => {
    setCookingSteps((prev) => {
      const newSteps = [...prev];
      const currentImages = newSteps[index].images || [];

      // Only add images up to the limit of 5 per step
      const availableSlots = 5 - currentImages.length;
      const filesToAdd = files.slice(0, availableSlots);

      if (filesToAdd.length < files.length) {
        toast.error(`Mỗi bước chỉ có thể chứa tối đa 5 ảnh. Chỉ thêm ${filesToAdd.length} ảnh.`);
      }

      filesToAdd.forEach((file) => {
        const imageOrder = currentImages.length + 1;
        currentImages.push({
          id: crypto.randomUUID(),
          image: file,
          imageOrder: imageOrder,
        });
      });

      newSteps[index].images = currentImages;
      return newSteps;
    });
  };

  const handleRemoveStepImage = (stepIndex: number, imageIndex: number) => {
    setCookingSteps((prev) => {
      const newSteps = [...prev];
      newSteps[stepIndex].images = (newSteps[stepIndex].images || []).filter(
        (_, idx) => idx !== imageIndex,
      );
      return newSteps;
    });
  };

  const handleReorderStepImages = (stepIndex: number, reorderedImages: CookingStep['images']) => {
    setCookingSteps((prev) => {
      const newSteps = [...prev];
      newSteps[stepIndex].images = reorderedImages;
      return newSteps;
    });
  };

  const reorderCookingSteps = (fromIndex: number, toIndex: number) => {
    setCookingSteps((prev) => {
      const newSteps = [...prev];
      const [removed] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, removed);

      // Renumber steps
      return newSteps.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }));
    });
  };

  const handleCookStepDragStart = (index: number) => {
    setDraggedStepIndex(index);
  };

  const handleCookStepDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleCookStepDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleCookStepDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedStepIndex !== null && draggedStepIndex !== toIndex) {
      reorderCookingSteps(draggedStepIndex, toIndex);
    }
    setDraggedStepIndex(null);
    setDragOverIndex(null);
  };

  return {
    cookingSteps,
    setCookingSteps,
    draggedStepIndex,
    dragOverIndex,
    addCookingStep,
    removeCookingStep,
    updateStepDescription,
    handleStepImageChange,
    handleRemoveStepImage,
    handleReorderStepImages,
    handleCookStepDragStart,
    handleCookStepDragOver,
    handleCookStepDragLeave,
    handleCookStepDrop,
  };
}
