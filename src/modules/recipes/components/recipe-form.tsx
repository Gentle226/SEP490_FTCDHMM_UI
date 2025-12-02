'use client';

import {
  Beef,
  ChefHat,
  Clock,
  Flame,
  Globe,
  ImageIcon,
  Plus,
  Salad,
  Search,
  Soup,
  Tag,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

// 5MB

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { Select } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';
import { useDebounce } from '@/base/hooks';
import { useAuth } from '@/modules/auth';
import {
  Ingredient,
  IngredientNameResponse,
  capitalizeFirstLetter,
  ingredientManagementService,
} from '@/modules/ingredients/services/ingredient-management.service';
import {
  Label as LabelType,
  labelManagementService,
} from '@/modules/labels/services/label-management.service';
import { User, userManagementService } from '@/modules/users/services/user-management.service';

import { recipeService } from '../services/recipe.service';
import { CookingStep, DraftDetailsResponse, RecipeDetail } from '../types';
import { CookingStepCard } from './cooking-step-card';
import { ImageCropDialog } from './image-crop-dialog';
import { IngredientCardWithDetails } from './ingredient-card-with-details';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface SelectedIngredient {
  id: string;
  name: string;
  quantityGram: number;
}

interface SelectedLabel {
  id: string;
  name: string;
  colorCode: string;
}

interface SelectedUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface RecipeFormProps {
  recipeId?: string;
  parentId?: string;
  draftId?: string;
  initialData?: RecipeDetail;
  initialDraft?: DraftDetailsResponse;
  mode?: 'create' | 'edit' | 'draft-edit';
}

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

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [cookTime, setCookTime] = useState(0);
  const [ration, setRation] = useState(1);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isCopiedRecipe, setIsCopiedRecipe] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: crypto.randomUUID(), stepOrder: 1, instruction: '', images: [] },
  ]);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Labels state
  const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
  const [labelSearch, setLabelSearch] = useState('');
  const [labelSearchResults, setLabelSearchResults] = useState<LabelType[]>([]);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const debouncedLabelSearch = useDebounce(labelSearch, 300);

  // Ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState<Ingredient[]>([]);
  const [usdaSearchResults, setUsdaSearchResults] = useState<IngredientNameResponse[]>([]);
  const [isIngredientPopoverOpen, setIsIngredientPopoverOpen] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingUsdaSearch, setIsLoadingUsdaSearch] = useState(false);
  const debouncedIngredientSearch = useDebounce(ingredientSearch, 300);

  // Tagged users state
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const debouncedUserSearch = useDebounce(userSearch, 300);

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
        mainImage ||
        mainImagePreview ||
        selectedLabels.length > 0 ||
        selectedIngredients.length > 0 ||
        selectedUsers.length > 0 ||
        cookingSteps.length > 1 ||
        cookingSteps.some((s) => s.instruction)
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
    mainImage,
    mainImagePreview,
    selectedLabels,
    selectedIngredients,
    selectedUsers,
    cookingSteps,
    mode,
  ]);

  // Search labels
  useEffect(() => {
    async function searchLabels() {
      if (!isLabelPopoverOpen) return;

      setIsLoadingLabels(true);
      try {
        const response = await labelManagementService.getLabels({
          keyword: debouncedLabelSearch,
          pageSize: 50,
        });
        setLabelSearchResults(response.items);
      } catch (error) {
        console.error('Failed to search labels:', error);
      } finally {
        setIsLoadingLabels(false);
      }
    }

    searchLabels();
  }, [debouncedLabelSearch, isLabelPopoverOpen]);

  // Search ingredients from local database
  useEffect(() => {
    async function searchIngredients() {
      if (!isIngredientPopoverOpen) return;

      setIsLoadingIngredients(true);
      setUsdaSearchResults([]); // Clear USDA results when starting new search
      try {
        const response = await ingredientManagementService.getIngredients({
          search: debouncedIngredientSearch,
          pageNumber: 1,
          pageSize: 50,
        });
        setIngredientSearchResults(response.items);
      } catch (error) {
        console.error('Failed to search ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    }

    searchIngredients();
  }, [debouncedIngredientSearch, isIngredientPopoverOpen]);

  // Manual USDA search function (triggered by button click)
  const handleSearchFromUsda = async () => {
    if (debouncedIngredientSearch.trim().length < 2) {
      return;
    }

    setIsLoadingUsdaSearch(true);
    try {
      const results = await ingredientManagementService.searchForRecipe(debouncedIngredientSearch);
      setUsdaSearchResults(results);
    } catch (error) {
      console.error('Failed to search from USDA:', error);
      setUsdaSearchResults([]);
    } finally {
      setIsLoadingUsdaSearch(false);
    }
  };

  // Search users for tagging
  useEffect(() => {
    async function searchUsers() {
      if (!isUserPopoverOpen) return;

      setIsLoadingUsers(true);
      try {
        const users = await userManagementService.getTaggableUsers(debouncedUserSearch);
        // Filter out current user and map to User type
        const filteredUsers = users
          .filter((user) => user.id !== currentUser?.id)
          .map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: '',
            createdAtUTC: '',
            status: 'Active',
            avatarUrl: undefined,
          }));
        setUserSearchResults(filteredUsers);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    searchUsers();
  }, [debouncedUserSearch, isUserPopoverOpen, currentUser?.id]);

  // Initialize form with draft data in draft-edit mode
  useEffect(() => {
    if (mode === 'draft-edit' && initialDraft) {
      setName(initialDraft.name || '');
      setDescription(initialDraft.description || '');
      // Normalize difficulty: convert MEDIUM/HARD/EASY to Capitalized format
      const normalizedDifficulty = initialDraft.difficulty
        ? ((initialDraft.difficulty.charAt(0).toUpperCase() +
            initialDraft.difficulty.slice(1).toLowerCase()) as 'Easy' | 'Medium' | 'Hard')
        : 'Easy';
      setDifficulty(normalizedDifficulty);
      setCookTime(initialDraft.cookTime || 0);
      setRation(initialDraft.ration || 1);

      // Set labels
      if (initialDraft.labels && initialDraft.labels.length > 0) {
        setSelectedLabels(
          initialDraft.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorCode: label.colorCode,
          })),
        );
      }

      // Set ingredients
      if (initialDraft.ingredients && initialDraft.ingredients.length > 0) {
        setSelectedIngredients(
          initialDraft.ingredients.map((ingredient) => ({
            id: ingredient.ingredientId,
            name: ingredient.name,
            quantityGram: ingredient.quantityGram,
          })),
        );
      }

      // Set tagged users
      if (initialDraft.taggedUser && initialDraft.taggedUser.length > 0) {
        setSelectedUsers(
          initialDraft.taggedUser.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          })),
        );
      }

      // Set cooking steps
      if (initialDraft.cookingSteps && initialDraft.cookingSteps.length > 0) {
        setCookingSteps(
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

      // Set main image preview
      if (initialDraft.imageUrl) {
        setMainImagePreview(initialDraft.imageUrl);
      }
    }
  }, [mode, initialDraft]);

  // Note: In create mode, we no longer auto-load a draft since users can now have multiple drafts
  // Users should explicitly select a draft from the drafts list if they want to continue from one
  // The draft-edit mode handles loading specific drafts via initialDraft prop

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setDifficulty(initialData.difficulty.value as 'Easy' | 'Medium' | 'Hard');
      setCookTime(initialData.cookTime || 0);
      setRation(initialData.ration || 1);

      // Set labels
      if (initialData.labels && initialData.labels.length > 0) {
        setSelectedLabels(
          initialData.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorCode: label.colorCode,
          })),
        );
      }

      // Set ingredients - API uses 'ingredientId' field
      if (initialData.ingredients && initialData.ingredients.length > 0) {
        setSelectedIngredients(
          initialData.ingredients.map((ingredient) => ({
            id: ingredient.ingredientId || ingredient.id || '',
            name: ingredient.name,
            quantityGram: ingredient.quantityGram,
          })),
        );
      }

      // Set tagged users
      if (initialData.taggedUsers && initialData.taggedUsers.length > 0) {
        setSelectedUsers(
          initialData.taggedUsers.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar?.imageUrl,
          })),
        );
      }

      // Set cooking steps
      if (initialData.cookingSteps && initialData.cookingSteps.length > 0) {
        setCookingSteps(
          initialData.cookingSteps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => ({
              id: crypto.randomUUID(),
              stepOrder: step.stepOrder,
              instruction: step.instruction,
              images:
                step.cookingStepImages?.map((img) => ({
                  id: img.imageId, // Use imageId (the actual Image table ID) for existing images
                  image: img.imageUrl || '',
                  imageOrder: img.imageOrder,
                  imageUrl: img.imageUrl,
                })) || [],
              image: undefined,
              imagePreview: step.imageUrl,
            })),
        );
      }

      // Set main image preview
      if (initialData.imageUrl) {
        setMainImagePreview(initialData.imageUrl);
      }
    }
  }, [mode, initialData]);

  // Handle copy recipe data from sessionStorage
  useEffect(() => {
    if (mode === 'create') {
      const copyDataStr = sessionStorage.getItem('recipesCopyData');
      if (copyDataStr) {
        try {
          const copyData = JSON.parse(copyDataStr) as {
            parentId: string;
            sourceName: string;
            sourceDescription: string;
            sourceImageUrl?: string;
            sourceIngredients: Array<{ ingredientId: string; name: string; quantityGram: number }>;
            sourceCookingSteps: Array<{
              stepOrder: number;
              instruction: string;
              cookingStepImages?: Array<{
                id: string;
                imageId: string;
                imageUrl: string;
                imageOrder: number;
              }>;
            }>;
            sourceDifficulty: string;
            sourceCookTime: number;
            sourceRation: number;
            sourceLabels: Array<{ id: string; name: string; colorCode: string }>;
          };

          // Set the parentId for the copy operation
          setCopyParentId(copyData.parentId);

          // Pre-fill the form with copied recipe data
          setName(`${copyData.sourceName} (Bản sao)`);
          setDescription(copyData.sourceDescription || '');
          setDifficulty((copyData.sourceDifficulty || 'Easy') as 'Easy' | 'Medium' | 'Hard');
          setCookTime(copyData.sourceCookTime || 0);
          setRation(copyData.sourceRation || 1);

          // Set labels from source recipe
          if (copyData.sourceLabels && copyData.sourceLabels.length > 0) {
            setSelectedLabels(
              copyData.sourceLabels.map((label) => ({
                id: label.id,
                name: label.name,
                colorCode: label.colorCode,
              })),
            );
          }

          // Set ingredients from source recipe
          if (copyData.sourceIngredients && copyData.sourceIngredients.length > 0) {
            setSelectedIngredients(
              copyData.sourceIngredients.map((ingredient) => ({
                id: ingredient.ingredientId || '',
                name: ingredient.name,
                quantityGram: ingredient.quantityGram,
              })),
            );
          }

          // Set cooking steps from source recipe
          if (copyData.sourceCookingSteps && copyData.sourceCookingSteps.length > 0) {
            setCookingSteps(
              copyData.sourceCookingSteps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step) => ({
                  id: crypto.randomUUID(),
                  stepOrder: step.stepOrder,
                  instruction: step.instruction,
                  images:
                    step.cookingStepImages?.map((img) => ({
                      id: img.imageId, // Use imageId (the actual Image table ID) for existing images
                      image: img.imageUrl || '',
                      imageOrder: img.imageOrder,
                      imageUrl: img.imageUrl,
                    })) || [],
                  image: undefined,
                })),
            );
          }

          // Set main image from source recipe if available
          if (copyData.sourceImageUrl) {
            setMainImagePreview(copyData.sourceImageUrl);
            setIsCopiedRecipe(true);
          }

          // Clear the sessionStorage after loading
          sessionStorage.removeItem('recipesCopyData');

          // Set unsaved changes flag since we've pre-filled the form
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to parse copy recipe data:', error);
          sessionStorage.removeItem('recipesCopyData');
        }
      }
    }
  }, [mode]);

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

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
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

  const handleStepImageChange = (index: number, files: File[]) => {
    const newSteps = [...cookingSteps];
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
    setCookingSteps(newSteps);
  };

  const addCookingStep = () => {
    setCookingSteps([
      ...cookingSteps,
      {
        id: crypto.randomUUID(),
        stepOrder: cookingSteps.length + 1,
        instruction: '',
        images: [],
      },
    ]);
  };

  const removeCookingStep = (index: number) => {
    const newSteps = cookingSteps.filter((_, i) => i !== index);
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepOrder: i + 1,
    }));
    setCookingSteps(renumberedSteps);
  };

  const updateStepDescription = (index: number, instruction: string) => {
    const newSteps = [...cookingSteps];
    newSteps[index].instruction = instruction;
    setCookingSteps(newSteps);
  };

  const reorderCookingSteps = (fromIndex: number, toIndex: number) => {
    const newSteps = [...cookingSteps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);

    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepOrder: i + 1,
    }));
    setCookingSteps(renumberedSteps);
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

  const addLabel = (label: LabelType) => {
    if (!selectedLabels.some((l) => l.id === label.id)) {
      setSelectedLabels((prev) => [...prev, label]);
    }
    setIsLabelPopoverOpen(false);
    setLabelSearch('');
  };

  const removeLabel = (labelId: string) => {
    setSelectedLabels((prev) => prev.filter((l) => l.id !== labelId));
  };

  const addUser = (user: User) => {
    // Prevent user from tagging themselves
    if (currentUser && user.id === currentUser.id) {
      toast.error('Không thể tự tag chính mình');
      return;
    }

    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [
        ...prev,
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatarUrl,
        },
      ]);
    }
    setIsUserPopoverOpen(false);
    setUserSearch('');
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Add ingredient from local database or USDA search
  const addIngredient = (ingredient: Ingredient | IngredientNameResponse) => {
    if (!selectedIngredients.some((i) => i.id === ingredient.id)) {
      // Capitalize the first letter of ingredient name for consistency
      const normalizedName = capitalizeFirstLetter(ingredient.name);
      setSelectedIngredients((prev) => [
        ...prev,
        { id: ingredient.id, name: normalizedName, quantityGram: 0 },
      ]);
    }
    setIsIngredientPopoverOpen(false);
    setIngredientSearch('');
    setUsdaSearchResults([]);
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
  };

  const updateIngredientQuantity = (ingredientId: string, quantityGram: number) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) => (ing.id === ingredientId ? { ...ing, quantityGram } : ing)),
    );
  };

  const handleInvalidField = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    if (input.validity.valueMissing) {
      input.setCustomValidity('Vui lòng điền vào trường này');
    } else if (input.validity.rangeUnderflow) {
      input.setCustomValidity('Giá trị phải lớn hơn 0');
    } else if (input.validity.rangeOverflow) {
      input.setCustomValidity('Giá trị quá lớn');
    }
  };

  const handleInvalidTextarea = (e: React.InvalidEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    if (textarea.validity.valueMissing) {
      textarea.setCustomValidity('Vui lòng điền vào trường này');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món ăn');
      return;
    }

    if (name.length > 100) {
      toast.error('Tên món không được vượt quá 100 ký tự');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho món ăn');
      return;
    }

    if (description.length > 1500) {
      toast.error('Mô tả không được vượt quá 1500 ký tự');
      return;
    }

    // In edit mode, image is optional
    // In create mode with copy, image is optional if we have a preview from the source recipe
    if (!mainImage && !isCopiedRecipe && mode === 'create') {
      toast.error('Vui lòng tải lên hình ảnh món ăn');
      return;
    }

    if (selectedLabels.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhãn');
      return;
    }

    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    if (
      selectedIngredients.some(
        (ingredient) => ingredient.quantityGram < 0.1 || ingredient.quantityGram > 10000,
      )
    ) {
      toast.error('Số lượng nguyên liệu phải từ 0.1 đến 10000 gram');
      return;
    }

    if (cookingSteps.some((step) => !step.instruction.trim())) {
      toast.error('Vui lòng nhập mô tả cho tất cả các bước');
      return;
    }

    if (cookTime <= 0) {
      toast.error('Thời gian nấu phải lớn hơn 0');
      return;
    }

    if (ration < 1) {
      toast.error('Khẩu phần phải ít nhất là 1');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate ingredient IDs before submission
      const invalidIngredients = selectedIngredients.filter((i) => !i.id);
      if (invalidIngredients.length > 0) {
        console.error('Invalid ingredients found:', invalidIngredients);
        toast.error('Có lỗi với dữ liệu nguyên liệu. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      const recipeData = {
        name,
        description,
        difficulty,
        cookTime,
        image: mainImage || undefined,
        ration,
        labelIds: selectedLabels.map((l) => l.id),
        ingredients: selectedIngredients.map((i) => ({
          ingredientId: i.id,
          quantityGram: i.quantityGram,
        })),
        taggedUserIds: selectedUsers.map((u) => u.id),
        cookingSteps,
      };

      if (mode === 'edit' && recipeId) {
        await recipeService.updateRecipe(recipeId, recipeData);
        toast.success('Công thức đã được cập nhật thành công');
      } else if (copyParentId) {
        // Copy recipe endpoint
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

    // Validate required name field
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      toast.error('Tên công thức phải từ 3 đến 100 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const draftData = {
        name: name.trim(),
        description,
        difficulty,
        cookTime,
        image: mainImage || undefined,
        ration,
        labelIds: selectedLabels.map((l) => l.id),
        ingredients: selectedIngredients.map((i) => ({
          ingredientId: i.id,
          quantityGram: i.quantityGram,
        })),
        taggedUserIds: selectedUsers.map((u) => u.id),
        cookingSteps,
      };

      // If in draft-edit mode, update existing draft; otherwise create new
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

    // Full validation before publishing
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món ăn');
      return;
    }

    if (name.length > 100) {
      toast.error('Tên món không được vượt quá 100 ký tự');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho món ăn');
      return;
    }

    if (description.length > 1500) {
      toast.error('Mô tả không được vượt quá 1500 ký tự');
      return;
    }

    if (!mainImage && !mainImagePreview) {
      toast.error('Vui lòng tải lên hình ảnh món ăn');
      return;
    }

    if (selectedLabels.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhãn');
      return;
    }

    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    if (
      selectedIngredients.some(
        (ingredient) => ingredient.quantityGram < 0.1 || ingredient.quantityGram > 10000,
      )
    ) {
      toast.error('Số lượng nguyên liệu phải từ 0.1 đến 10000 gram');
      return;
    }

    if (cookingSteps.some((step) => !step.instruction.trim())) {
      toast.error('Vui lòng nhập mô tả cho tất cả các bước');
      return;
    }

    if (cookTime <= 0) {
      toast.error('Thời gian nấu phải lớn hơn 0');
      return;
    }

    if (ration < 1) {
      toast.error('Khẩu phần phải ít nhất là 1');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate ingredient IDs before submission
      const invalidIngredients = selectedIngredients.filter((i) => !i.id);
      if (invalidIngredients.length > 0) {
        console.error('Invalid ingredients found:', invalidIngredients);
        toast.error('Có lỗi với dữ liệu nguyên liệu. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      const recipeData = {
        name,
        description,
        difficulty,
        cookTime,
        image: mainImage || undefined,
        ration,
        labelIds: selectedLabels.map((l) => l.id),
        ingredients: selectedIngredients.map((i) => ({
          ingredientId: i.id,
          quantityGram: i.quantityGram,
        })),
        taggedUserIds: selectedUsers.map((u) => u.id),
        cookingSteps,
      };

      // Publish draft as a recipe
      if (mode === 'draft-edit' && draftId) {
        await recipeService.publishDraft(draftId, recipeData, mainImagePreview || undefined);
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
      setMainImage(null);
      setMainImagePreview(null);
      setSelectedLabels([]);
      setSelectedIngredients([]);
      setSelectedUsers([]);
      setCookingSteps([{ id: crypto.randomUUID(), stepOrder: 1, instruction: '', images: [] }]);
      setHasUnsavedChanges(false);
      toast.success('Biểu mẫu đã được xóa');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-screen-2xl space-y-6 px-4">
      {/* Main Image and Basic Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
        {/* Image Section - Left */}
        <div className="space-y-2">
          <Label>
            <ImageIcon className="h-4 w-4 text-[#99b94a]" />
            Hình ảnh món ăn
          </Label>
          {mainImagePreview ? (
            <div className="relative h-75 w-full overflow-hidden rounded-lg border">
              <Image
                src={mainImagePreview}
                alt="Recipe preview"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setMainImage(null);
                  setMainImagePreview(null);
                  setIsCopiedRecipe(false);
                }}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              className={`flex h-75 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                isDragOver
                  ? 'border-[#99b94a] bg-green-50 ring-2 ring-[#b2df3f]'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Salad
                className={`h-8 w-8 transition-colors ${
                  isDragOver ? 'text-[#99b94a]' : 'text-gray-400'
                }`}
              />
              <span
                className={`mt-2 px-2 text-center text-xs transition-colors ${
                  isDragOver ? 'text-[#99b94a]' : 'text-gray-500'
                }`}
              >
                {isDragOver ? 'Thả ảnh vào đây' : 'Tải ảnh lên hoặc kéo thả'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageChange}
              />
            </label>
          )}
        </div>

        {/* Right Section - Title, Description, Difficulty, Cook Time, Ration */}
        <div className="min-w-0 space-y-4">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              <ChefHat className="h-4 w-4 text-[#99b94a]" />
              Tên món
            </Label>
            <Input
              id="name"
              placeholder="Tên món ăn của bạn"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value.slice(0, 255))}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              onInvalid={handleInvalidField}
              maxLength={255}
            />
            <p
              className={`text-right text-xs transition-opacity ${isNameFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {name.length}/255
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <UtensilsCrossed className="h-4 w-4 text-[#99b94a]" />
              Mô tả
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Hãy chia sẻ với mọi người về món này của bạn nhé - ai đã truyền cảm hứng cho bạn, tại sao nó đặc biệt, bạn thích thưởng thức nó như thế nào..."
              rows={2}
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              onInvalid={handleInvalidTextarea}
              maxLength={2000}
              required
              className="w-full break-words sm:min-h-24 md:min-h-28"
            />
            <p
              className={`text-right text-xs transition-opacity ${isDescriptionFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {description.length}/2000
            </p>
          </div>

          {/* Difficulty, Cook Time, Ration - Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#99b94a]" />
                Độ khó
              </Label>
              <Select
                options={[
                  { value: 'Easy', label: 'Dễ' },
                  { value: 'Medium', label: 'Trung bình' },
                  { value: 'Hard', label: 'Khó' },
                ]}
                value={difficulty}
                onChange={(value) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard')}
                placeholder="Chọn độ khó"
                searchable={false}
              />
            </div>

            {/* Cook Time */}
            <div className="space-y-2">
              <Label htmlFor="cookTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#99b94a]" />
                Thời gian nấu
              </Label>
              <div className="relative">
                <Input
                  id="cookTime"
                  type="number"
                  placeholder="30"
                  value={cookTime}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCookTime(Math.min(Math.max(val, 1), 1440));
                  }}
                  min="1"
                  max="1440"
                  step="1"
                  className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                  phút
                </span>
              </div>
            </div>

            {/* Ration */}
            <div className="space-y-2">
              <Label htmlFor="ration" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#99b94a]" />
                Khẩu phần
              </Label>
              <div className="relative">
                <Input
                  id="ration"
                  type="number"
                  placeholder="2"
                  value={ration}
                  onChange={(e) => setRation(parseInt(e.target.value) || 1)}
                  onInvalid={handleInvalidField}
                  min="1"
                  className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                  người
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Labels and Tagged Users - Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Tagged Users (1/3 width) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#99b94a]" />
            Tag người dùng
          </Label>

          {/* Selected Users */}
          <div className="flex min-h-[60px] flex-wrap gap-2 rounded-lg border p-3">
            {selectedUsers.length === 0 ? (
              <span className="flex w-full justify-center pt-2 text-center text-xs text-gray-400">
                Chưa có người dùng nào được tag
              </span>
            ) : (
              selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-900"
                >
                  {user.avatar && (
                    <Image
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  )}
                  <span className="truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUser(user.id)}
                    className="ml-1 rounded-full hover:bg-blue-200"
                    aria-label={`Remove ${user.firstName} ${user.lastName}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Search and Add Users */}
          <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Thêm người dùng
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm kiếm người dùng..."
                  value={userSearch}
                  onValueChange={setUserSearch}
                />
                <CommandList>
                  {isLoadingUsers ? (
                    <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
                  ) : userSearchResults.length === 0 ? (
                    <CommandEmpty>Không tìm thấy người dùng nào.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {userSearchResults.map((user) => {
                        const isSelected = selectedUsers.some((u) => u.id === user.id);
                        return (
                          <CommandItem
                            key={user.id}
                            onSelect={() => addUser(user)}
                            disabled={isSelected}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full items-center gap-2">
                              {user.avatarUrl && (
                                <Image
                                  src={user.avatarUrl}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                {user.email && (
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                )}
                              </div>
                              {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Column: Labels (2/3 width) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#99b94a]" />
            Nhãn
          </Label>

          {/* Selected Labels */}
          <div className="flex min-h-[60px] flex-wrap gap-2 rounded-lg border p-3">
            {selectedLabels.length === 0 ? (
              <span className="flex w-full justify-center pt-2 text-xs text-gray-400">
                Chưa có nhãn nào được chọn
              </span>
            ) : (
              selectedLabels.map((label) => {
                const labelStyle = { backgroundColor: label.colorCode } as React.CSSProperties;
                return (
                  <div
                    key={label.id}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white"
                    style={labelStyle}
                    suppressHydrationWarning
                  >
                    <span>{label.name}</span>
                    <button
                      type="button"
                      onClick={() => removeLabel(label.id)}
                      className="ml-1 rounded-full hover:bg-white/20"
                      aria-label={`Remove ${label.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Search and Add Labels */}
          <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhãn
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm kiếm nhãn..."
                  value={labelSearch}
                  onValueChange={setLabelSearch}
                />
                <CommandList>
                  {isLoadingLabels ? (
                    <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
                  ) : labelSearchResults.length === 0 ? (
                    <CommandEmpty>Không tìm thấy nhãn nào.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {labelSearchResults.map((label) => {
                        const isSelected = selectedLabels.some((l) => l.id === label.id);
                        const colorStyle = {
                          backgroundColor: label.colorCode,
                        } as React.CSSProperties;
                        return (
                          <CommandItem
                            key={label.id}
                            onSelect={() => addLabel(label)}
                            disabled={isSelected}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full items-center gap-2">
                              <div
                                className="h-4 w-4 flex-shrink-0 rounded-full"
                                style={colorStyle}
                                suppressHydrationWarning
                              />
                              <span className="flex-1">{label.name}</span>
                              {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Ingredients and Cooking Steps - Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Ingredients (1/3 width) */}
        <div className="space-y-4">
          <Label>
            <Beef className="h-4 w-4 text-[#99b94a]" />
            Nguyên liệu
          </Label>

          {/* Selected Ingredients */}
          <div className="min-h-[150px] rounded-lg border p-3">
            {selectedIngredients.length === 0 ? (
              <div className="flex h-full items-center justify-center pt-13 text-sm text-gray-400">
                Chưa có nguyên liệu nào được chọn
              </div>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ingredient) => (
                  <IngredientCardWithDetails
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdateQuantity={updateIngredientQuantity}
                    onRemove={removeIngredient}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Search and Add Ingredients */}
          <Popover open={isIngredientPopoverOpen} onOpenChange={setIsIngredientPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nguyên liệu
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[354px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={ingredientSearch}
                  onValueChange={setIngredientSearch}
                />
                <CommandList>
                  {isLoadingIngredients ? (
                    <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <>
                      {/* Local ingredients results */}
                      {ingredientSearchResults.length > 0 && (
                        <CommandGroup heading="Nguyên liệu có sẵn">
                          {ingredientSearchResults.map((ingredient) => {
                            const isSelected = selectedIngredients.some(
                              (i) => i.id === ingredient.id,
                            );
                            return (
                              <CommandItem
                                key={ingredient.id}
                                onSelect={() => addIngredient(ingredient)}
                                disabled={isSelected}
                                className="cursor-pointer"
                              >
                                <div className="flex w-full items-center gap-2">
                                  <span className="flex-1">{ingredient.name}</span>
                                  {isSelected && (
                                    <span className="text-xs text-gray-500">Đã chọn</span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}

                      {/* USDA search results */}
                      {usdaSearchResults.length > 0 && (
                        <CommandGroup heading="Tìm thấy từ USDA">
                          {usdaSearchResults.map((ingredient) => {
                            const isSelected = selectedIngredients.some(
                              (i) => i.id === ingredient.id,
                            );
                            return (
                              <CommandItem
                                key={ingredient.id}
                                onSelect={() => addIngredient(ingredient)}
                                disabled={isSelected}
                                className="cursor-pointer"
                              >
                                <div className="flex w-full items-center gap-2">
                                  <span className="flex-1">
                                    {capitalizeFirstLetter(ingredient.name)}
                                  </span>
                                  <span className="text-xs text-amber-600">USDA</span>
                                  {isSelected && (
                                    <span className="text-xs text-gray-500">Đã chọn</span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}

                      {/* Empty state */}
                      {ingredientSearchResults.length === 0 &&
                        usdaSearchResults.length === 0 &&
                        !isLoadingUsdaSearch &&
                        (debouncedIngredientSearch.trim().length >= 2 ? (
                          <div className="py-4 text-center text-sm text-gray-500">
                            Không tìm thấy nguyên liệu trong hệ thống.
                          </div>
                        ) : (
                          <div className="py-6 text-center text-sm text-gray-500">
                            Nhập ít nhất 2 ký tự để tìm kiếm
                          </div>
                        ))}

                      {/* USDA Search Button */}
                      {debouncedIngredientSearch.trim().length >= 2 && (
                        <div className="border-t p-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            disabled={isLoadingUsdaSearch}
                            onClick={handleSearchFromUsda}
                          >
                            {isLoadingUsdaSearch ? (
                              <>
                                <Search className="h-4 w-4 animate-pulse" />
                                Đang tìm từ USDA...
                              </>
                            ) : (
                              <>
                                <Globe className="h-4 w-4" />
                                Tìm từ USDA
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Column: Cooking Steps (2/3 width) */}
        <div className="space-y-4">
          <Label>
            <Soup className="h-4 w-4 text-[#99b94a]" />
            Các bước nấu
          </Label>

          {cookingSteps.map((step, index) => (
            <CookingStepCard
              key={step.id}
              step={step}
              index={index}
              isDragOver={dragOverIndex === index}
              canRemove={cookingSteps.length > 1}
              onDragStart={() => handleCookStepDragStart(index)}
              onDragOver={(e) => handleCookStepDragOver(e, index)}
              onDragLeave={handleCookStepDragLeave}
              onDrop={(e) => handleCookStepDrop(e, index)}
              onUpdateInstruction={(instruction) => updateStepDescription(index, instruction)}
              onAddImage={(files) => handleStepImageChange(index, files)}
              onRemoveImage={(imageIndex) => {
                const newSteps = [...cookingSteps];
                newSteps[index].images = (newSteps[index].images || []).filter(
                  (_, idx) => idx !== imageIndex,
                );
                setCookingSteps(newSteps);
              }}
              onReorderImages={(reorderedImages) => {
                const newSteps = [...cookingSteps];
                newSteps[index].images = reorderedImages;
                setCookingSteps(newSteps);
              }}
              onRemoveStep={() => removeCookingStep(index)}
            />
          ))}

          <Button type="button" onClick={addCookingStep} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Bước làm
          </Button>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 border-t pt-6">
        {mode === 'create' && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              Xóa biểu mẫu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Lưu bản nháp
            </Button>
          </>
        )}
        {mode === 'draft-edit' && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật bản nháp'}
            </Button>
            <Button
              type="button"
              onClick={handlePublishDraft}
              disabled={isSubmitting}
              className="bg-[#99b94a] hover:bg-[#7a9a3d]"
            >
              {isSubmitting ? 'Đang xuất bản...' : 'Xuất bản'}
            </Button>
          </>
        )}
        {mode !== 'draft-edit' && (
          <Button type="submit" disabled={isSubmitting} className="bg-[#99b94a] hover:bg-[#7a9a3d]">
            {isSubmitting
              ? mode === 'edit'
                ? 'Đang cập nhật...'
                : 'Đang tạo...'
              : mode === 'edit'
                ? 'Cập nhật'
                : 'Lên bài'}
          </Button>
        )}
      </div>

      {/* Image Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={isCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropDialogOpen(false);
            setImageToCrop(null);
          }}
        />
      )}
    </form>
  );
}
