'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/modules/auth';
import {
  useCookingSteps,
  useImageUpload,
  useIngredientSearch,
  useLabelSearch,
  useUserTagging,
} from '@/modules/recipes/hooks';
import { recipeService } from '@/modules/recipes/services/recipe.service';

import { ImageCropDialog } from '../image-crop-dialog';
import { RecipeBasicInfo } from './recipe-basic-info';
import { RecipeCookingStepsSection } from './recipe-cooking-steps-section';
import { RecipeFormActions } from './recipe-form-actions';
import { RecipeIngredientsSection } from './recipe-ingredients-section';
import { RecipeLabelsSection } from './recipe-labels-section';
import { RecipeMainImage } from './recipe-main-image';
import { RecipeUsersSection } from './recipe-users-section';
import { Difficulty, RecipeFormProps } from './types';

export function RecipeForm({
  recipeId,
  parentId,
  draftId,
  initialData,
  initialDraft,
  mode = 'create',
}: RecipeFormProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copyParentId, setCopyParentId] = useState<string | undefined>(parentId);

  // Basic info state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [cookTime, setCookTime] = useState(0);
  const [ration, setRation] = useState(1);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  // Hooks for different sections
  const imageUpload = useImageUpload();
  const ingredientSearch = useIngredientSearch();
  const labelSearch = useLabelSearch();
  const userTagging = useUserTagging(currentUser?.id);
  const cookingStepsManager = useCookingSteps();

  // Warn user about unsaved changes before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  // Track unsaved changes when form fields change
  useEffect(() => {
    if (mode === 'create') {
      if (
        name ||
        description ||
        difficulty !== 'Easy' ||
        cookTime > 0 ||
        ration !== 1 ||
        imageUpload.mainImage ||
        imageUpload.mainImagePreview ||
        labelSearch.selectedLabels.length > 0 ||
        ingredientSearch.selectedIngredients.length > 0 ||
        userTagging.selectedUsers.length > 0 ||
        cookingStepsManager.cookingSteps.length > 1 ||
        cookingStepsManager.cookingSteps.some((s) => s.instruction)
      ) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }
  }, [
    name,
    description,
    difficulty,
    cookTime,
    ration,
    imageUpload.mainImage,
    imageUpload.mainImagePreview,
    labelSearch.selectedLabels,
    ingredientSearch.selectedIngredients,
    userTagging.selectedUsers,
    cookingStepsManager.cookingSteps,
    mode,
  ]);

  // Initialize form with draft data in draft-edit mode
  useEffect(() => {
    if (mode === 'draft-edit' && initialDraft) {
      setName(initialDraft.name || '');
      setDescription(initialDraft.description || '');
      const normalizedDifficulty = initialDraft.difficulty
        ? ((initialDraft.difficulty.charAt(0).toUpperCase() +
            initialDraft.difficulty.slice(1).toLowerCase()) as Difficulty)
        : 'Easy';
      setDifficulty(normalizedDifficulty);
      setCookTime(initialDraft.cookTime || 0);
      setRation(initialDraft.ration || 1);

      if (initialDraft.labels && initialDraft.labels.length > 0) {
        labelSearch.setSelectedLabels(
          initialDraft.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorCode: label.colorCode,
          })),
        );
      }

      if (initialDraft.ingredients && initialDraft.ingredients.length > 0) {
        ingredientSearch.setSelectedIngredients(
          initialDraft.ingredients.map((ingredient) => ({
            id: ingredient.ingredientId,
            name: ingredient.name,
            quantityGram: ingredient.quantityGram,
          })),
        );
      }

      if (initialDraft.taggedUser && initialDraft.taggedUser.length > 0) {
        userTagging.setSelectedUsers(
          initialDraft.taggedUser.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          })),
        );
      }

      if (initialDraft.cookingSteps && initialDraft.cookingSteps.length > 0) {
        cookingStepsManager.setCookingSteps(
          initialDraft.cookingSteps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => ({
              id: crypto.randomUUID(),
              stepOrder: step.stepOrder,
              instruction: step.instruction || '',
              images:
                step.cookingStepImages?.map((img) => ({
                  id: img.id,
                  image: img.imageUrl || '',
                  imageOrder: img.imageOrder,
                  imageUrl: img.imageUrl,
                })) || [],
            })),
        );
      }

      if (initialDraft.imageUrl) {
        imageUpload.setMainImagePreview(initialDraft.imageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialDraft]);

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setDifficulty(initialData.difficulty.value as Difficulty);
      setCookTime(initialData.cookTime || 0);
      setRation(initialData.ration || 1);

      if (initialData.labels && initialData.labels.length > 0) {
        labelSearch.setSelectedLabels(
          initialData.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorCode: label.colorCode,
          })),
        );
      }

      if (initialData.ingredients && initialData.ingredients.length > 0) {
        ingredientSearch.setSelectedIngredients(
          initialData.ingredients.map((ingredient) => ({
            id: ingredient.ingredientId || ingredient.id || '',
            name: ingredient.name,
            quantityGram: ingredient.quantityGram,
          })),
        );
      }

      if (initialData.taggedUser && initialData.taggedUser.length > 0) {
        userTagging.setSelectedUsers(
          initialData.taggedUser.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatarUrl,
          })),
        );
      }

      if (initialData.cookingSteps && initialData.cookingSteps.length > 0) {
        cookingStepsManager.setCookingSteps(
          initialData.cookingSteps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => ({
              id: crypto.randomUUID(),
              stepOrder: step.stepOrder,
              instruction: step.instruction,
              images:
                step.cookingStepImages?.map((img) => ({
                  id: img.imageId,
                  image: img.imageUrl || '',
                  imageOrder: img.imageOrder,
                  imageUrl: img.imageUrl,
                })) || [],
              image: undefined,
              imagePreview: step.imageUrl,
            })),
        );
      }

      if (initialData.imageUrl) {
        imageUpload.setMainImagePreview(initialData.imageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData]);

  // Handle copy recipe data from sessionStorage
  useEffect(() => {
    if (mode === 'create') {
      const copyDataStr = sessionStorage.getItem('recipesCopyData');
      if (copyDataStr) {
        try {
          const copyData = JSON.parse(copyDataStr);

          setCopyParentId(copyData.parentId);
          setName(`${copyData.sourceName} (Bản sao)`);
          setDescription(copyData.sourceDescription || '');
          setDifficulty((copyData.sourceDifficulty || 'Easy') as Difficulty);
          setCookTime(copyData.sourceCookTime || 0);
          setRation(copyData.sourceRation || 1);

          if (copyData.sourceLabels && copyData.sourceLabels.length > 0) {
            labelSearch.setSelectedLabels(
              copyData.sourceLabels.map(
                (label: { id: string; name: string; colorCode: string }) => ({
                  id: label.id,
                  name: label.name,
                  colorCode: label.colorCode,
                }),
              ),
            );
          }

          if (copyData.sourceIngredients && copyData.sourceIngredients.length > 0) {
            ingredientSearch.setSelectedIngredients(
              copyData.sourceIngredients.map(
                (ingredient: { ingredientId: string; name: string; quantityGram: number }) => ({
                  id: ingredient.ingredientId || '',
                  name: ingredient.name,
                  quantityGram: ingredient.quantityGram,
                }),
              ),
            );
          }

          if (copyData.sourceCookingSteps && copyData.sourceCookingSteps.length > 0) {
            cookingStepsManager.setCookingSteps(
              copyData.sourceCookingSteps
                .sort(
                  (a: { stepOrder: number }, b: { stepOrder: number }) => a.stepOrder - b.stepOrder,
                )
                .map(
                  (step: {
                    stepOrder: number;
                    instruction: string;
                    cookingStepImages?: Array<{
                      id: string;
                      imageId: string;
                      imageUrl: string;
                      imageOrder: number;
                    }>;
                  }) => ({
                    id: crypto.randomUUID(),
                    stepOrder: step.stepOrder,
                    instruction: step.instruction,
                    images:
                      step.cookingStepImages?.map((img) => ({
                        id: img.imageId,
                        image: img.imageUrl || '',
                        imageOrder: img.imageOrder,
                        imageUrl: img.imageUrl,
                      })) || [],
                    image: undefined,
                  }),
                ),
            );
          }

          if (copyData.sourceImageUrl) {
            imageUpload.setMainImagePreview(copyData.sourceImageUrl);
            imageUpload.setIsCopiedRecipe(true);
          }

          sessionStorage.removeItem('recipesCopyData');
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to parse copy recipe data:', error);
          sessionStorage.removeItem('recipesCopyData');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món ăn');
      return false;
    }

    if (name.length > 100) {
      toast.error('Tên món không được vượt quá 100 ký tự');
      return false;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho món ăn');
      return false;
    }

    if (description.length > 1500) {
      toast.error('Mô tả không được vượt quá 1500 ký tự');
      return false;
    }

    if (!imageUpload.mainImage && !imageUpload.isCopiedRecipe && mode === 'create') {
      toast.error('Vui lòng tải lên hình ảnh món ăn');
      return false;
    }

    if (labelSearch.selectedLabels.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhãn');
      return false;
    }

    if (ingredientSearch.selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return false;
    }

    if (
      ingredientSearch.selectedIngredients.some(
        (ingredient) => ingredient.quantityGram < 0.1 || ingredient.quantityGram > 10000,
      )
    ) {
      toast.error('Số lượng nguyên liệu phải từ 0.1 đến 10000 gram');
      return false;
    }

    if (cookingStepsManager.cookingSteps.some((step) => !step.instruction.trim())) {
      toast.error('Vui lòng nhập mô tả cho tất cả các bước');
      return false;
    }

    if (cookTime <= 0) {
      toast.error('Thời gian nấu phải lớn hơn 0');
      return false;
    }

    if (ration < 1) {
      toast.error('Khẩu phần phải ít nhất là 1');
      return false;
    }

    return true;
  };

  const buildRecipeData = () => ({
    name,
    description,
    difficulty,
    cookTime,
    image: imageUpload.mainImage || undefined,
    ration,
    labelIds: labelSearch.selectedLabels.map((l) => l.id),
    ingredients: ingredientSearch.selectedIngredients.map((i) => ({
      ingredientId: i.id,
      quantityGram: i.quantityGram,
    })),
    taggedUserIds: userTagging.selectedUsers.map((u) => u.id),
    cookingSteps: cookingStepsManager.cookingSteps,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const invalidIngredients = ingredientSearch.selectedIngredients.filter((i) => !i.id);
      if (invalidIngredients.length > 0) {
        console.error('Invalid ingredients found:', invalidIngredients);
        toast.error('Có lỗi với dữ liệu nguyên liệu. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      const recipeData = buildRecipeData();

      if (mode === 'edit' && recipeId) {
        await recipeService.updateRecipe(recipeId, recipeData);
        toast.success('Công thức đã được cập nhật thành công');
      } else if (copyParentId) {
        await recipeService.copyRecipe(copyParentId, recipeData);
        toast.success('Công thức đã được sao chép thành công');
      } else {
        await recipeService.createRecipe(recipeData);
        toast.success('Công thức đã được tạo thành công');
      }

      setHasUnsavedChanges(false);
      router.push('/myrecipe');
    } catch (error) {
      console.error('Submit recipe error:', error);
      toast.error(
        mode === 'edit'
          ? 'Có lỗi xảy ra khi cập nhật công thức'
          : 'Có lỗi xảy ra khi tạo công thức',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSubmitting) return;

    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      toast.error('Tên công thức phải từ 3 đến 100 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const draftData = buildRecipeData();

      if (mode === 'draft-edit' && draftId) {
        await recipeService.updateDraft(draftId, draftData);
        toast.success('Bản nháp đã được cập nhật');
      } else {
        await recipeService.createDraft(draftData);
        toast.success('Bản nháp đã được lưu');
      }

      setHasUnsavedChanges(false);
      router.push('/drafts');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Có lỗi xảy ra khi lưu nháp công thức');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishDraft = async () => {
    if (isSubmitting) return;

    // Validate for publishing (stricter than save draft)
    if (!validateForm()) return;

    if (!imageUpload.mainImage && !imageUpload.mainImagePreview) {
      toast.error('Vui lòng tải lên hình ảnh món ăn');
      return;
    }

    setIsSubmitting(true);

    try {
      const invalidIngredients = ingredientSearch.selectedIngredients.filter((i) => !i.id);
      if (invalidIngredients.length > 0) {
        console.error('Invalid ingredients found:', invalidIngredients);
        toast.error('Có lỗi với dữ liệu nguyên liệu. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      const recipeData = buildRecipeData();

      if (mode === 'draft-edit' && draftId) {
        await recipeService.publishDraft(
          draftId,
          recipeData,
          imageUpload.mainImagePreview || undefined,
        );
        toast.success('Công thức đã được xuất bản thành công');
      }

      setHasUnsavedChanges(false);
      router.push('/myrecipe');
    } catch (error) {
      console.error('Publish draft error:', error);
      toast.error('Có lỗi xảy ra khi xuất bản công thức');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    if (!hasUnsavedChanges || confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu biểu mẫu?')) {
      setName('');
      setDescription('');
      setDifficulty('Easy');
      setCookTime(0);
      setRation(1);
      imageUpload.handleRemoveImage();
      labelSearch.setSelectedLabels([]);
      ingredientSearch.setSelectedIngredients([]);
      userTagging.setSelectedUsers([]);
      cookingStepsManager.setCookingSteps([
        { id: crypto.randomUUID(), stepOrder: 1, instruction: '', images: [] },
      ]);
      setHasUnsavedChanges(false);
      toast.success('Biểu mẫu đã được xóa');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-screen-2xl space-y-4 px-2 sm:space-y-6 sm:px-4"
    >
      {/* Main Image and Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-[300px_1fr]">
        <RecipeMainImage
          mainImagePreview={imageUpload.mainImagePreview}
          isDragOver={imageUpload.isDragOver}
          onRemoveImage={imageUpload.handleRemoveImage}
          onMainImageChange={imageUpload.handleMainImageChange}
          onDragOver={imageUpload.handleDragOver}
          onDragLeave={imageUpload.handleDragLeave}
          onDrop={imageUpload.handleDrop}
        />

        <RecipeBasicInfo
          name={name}
          description={description}
          difficulty={difficulty}
          cookTime={cookTime}
          ration={ration}
          isNameFocused={isNameFocused}
          isDescriptionFocused={isDescriptionFocused}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onDifficultyChange={setDifficulty}
          onCookTimeChange={setCookTime}
          onRationChange={setRation}
          onNameFocusChange={setIsNameFocused}
          onDescriptionFocusChange={setIsDescriptionFocused}
        />
      </div>

      {/* Labels and Tagged Users - Side by Side */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_2fr]">
        <RecipeUsersSection
          selectedUsers={userTagging.selectedUsers}
          userSearch={userTagging.userSearch}
          userSearchResults={userTagging.userSearchResults}
          isUserPopoverOpen={userTagging.isUserPopoverOpen}
          isLoadingUsers={userTagging.isLoadingUsers}
          onUserSearchChange={userTagging.setUserSearch}
          onPopoverOpenChange={userTagging.setIsUserPopoverOpen}
          onAddUser={userTagging.addUser}
          onRemoveUser={userTagging.removeUser}
        />

        <RecipeLabelsSection
          selectedLabels={labelSearch.selectedLabels}
          labelSearch={labelSearch.labelSearch}
          labelSearchResults={labelSearch.labelSearchResults}
          isLabelPopoverOpen={labelSearch.isLabelPopoverOpen}
          isLoadingLabels={labelSearch.isLoadingLabels}
          onLabelSearchChange={labelSearch.setLabelSearch}
          onPopoverOpenChange={labelSearch.setIsLabelPopoverOpen}
          onAddLabel={labelSearch.addLabel}
          onRemoveLabel={labelSearch.removeLabel}
        />
      </div>

      {/* Ingredients and Cooking Steps - Side by Side */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_2fr]">
        <RecipeIngredientsSection
          selectedIngredients={ingredientSearch.selectedIngredients}
          ingredientSearch={ingredientSearch.ingredientSearch}
          ingredientSearchResults={ingredientSearch.ingredientSearchResults}
          usdaSearchResults={ingredientSearch.usdaSearchResults}
          isIngredientPopoverOpen={ingredientSearch.isIngredientPopoverOpen}
          isLoadingIngredients={ingredientSearch.isLoadingIngredients}
          isLoadingUsdaSearch={ingredientSearch.isLoadingUsdaSearch}
          debouncedIngredientSearch={ingredientSearch.debouncedIngredientSearch}
          onIngredientSearchChange={ingredientSearch.setIngredientSearch}
          onPopoverOpenChange={ingredientSearch.setIsIngredientPopoverOpen}
          onAddIngredient={ingredientSearch.addIngredient}
          onRemoveIngredient={ingredientSearch.removeIngredient}
          onUpdateQuantity={ingredientSearch.updateIngredientQuantity}
          onSearchFromUsda={ingredientSearch.handleSearchFromUsda}
        />

        <RecipeCookingStepsSection
          cookingSteps={cookingStepsManager.cookingSteps}
          dragOverIndex={cookingStepsManager.dragOverIndex}
          onDragStart={cookingStepsManager.handleCookStepDragStart}
          onDragOver={cookingStepsManager.handleCookStepDragOver}
          onDragLeave={cookingStepsManager.handleCookStepDragLeave}
          onDrop={cookingStepsManager.handleCookStepDrop}
          onUpdateInstruction={cookingStepsManager.updateStepDescription}
          onAddImage={cookingStepsManager.handleStepImageChange}
          onRemoveImage={cookingStepsManager.handleRemoveStepImage}
          onReorderImages={cookingStepsManager.handleReorderStepImages}
          onRemoveStep={cookingStepsManager.removeCookingStep}
          onAddStep={cookingStepsManager.addCookingStep}
        />
      </div>

      {/* Submit Buttons */}
      <RecipeFormActions
        mode={mode}
        isSubmitting={isSubmitting}
        onClearForm={handleClearForm}
        onSaveDraft={handleSaveDraft}
        onPublishDraft={handlePublishDraft}
      />

      {/* Image Crop Dialog */}
      {imageUpload.imageToCrop && (
        <ImageCropDialog
          open={imageUpload.isCropDialogOpen}
          imageSrc={imageUpload.imageToCrop}
          onCropComplete={imageUpload.handleCropComplete}
          onCancel={imageUpload.handleCropCancel}
        />
      )}
    </form>
  );
}
