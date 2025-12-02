'use client';

import { useEffect, useState } from 'react';

import { useDebounce } from '@/base/hooks';
import {
  Label as LabelType,
  labelManagementService,
} from '@/modules/labels/services/label-management.service';
import { SelectedLabel } from '@/modules/recipes/components/recipe-form/types';

export interface UseLabelSearchResult {
  // State
  labelSearch: string;
  setLabelSearch: (value: string) => void;
  labelSearchResults: LabelType[];
  isLabelPopoverOpen: boolean;
  setIsLabelPopoverOpen: (value: boolean) => void;
  isLoadingLabels: boolean;

  // Selected labels
  selectedLabels: SelectedLabel[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<SelectedLabel[]>>;

  // Actions
  addLabel: (label: LabelType) => void;
  removeLabel: (labelId: string) => void;
}

export function useLabelSearch(initialLabels: SelectedLabel[] = []): UseLabelSearchResult {
  const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>(initialLabels);
  const [labelSearch, setLabelSearch] = useState('');
  const [labelSearchResults, setLabelSearchResults] = useState<LabelType[]>([]);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const debouncedLabelSearch = useDebounce(labelSearch, 300);

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

  return {
    labelSearch,
    setLabelSearch,
    labelSearchResults,
    isLabelPopoverOpen,
    setIsLabelPopoverOpen,
    isLoadingLabels,
    selectedLabels,
    setSelectedLabels,
    addLabel,
    removeLabel,
  };
}
