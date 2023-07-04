import { create } from "zustand";

interface UiState {
  newData: boolean;
  originalQuery: string;
  isLoading: boolean;
  areDataCopied: boolean;
  setNewData: (value: boolean) => void;
  setOriginalQuery: (query: string) => void;
  setIsLoading: (value: boolean) => void;
  setAreDataCopied: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  newData: true,
  originalQuery: "",
  isLoading: false,
  areDataCopied: false,
  setNewData: (value) => set((state) => ({ newData: value })),
  setOriginalQuery: (query) => set((state) => ({ originalQuery: query })),
  setIsLoading: (value) => set((state) => ({ isLoading: value })),
  setAreDataCopied: (value) => set((state) => ({ areDataCopied: value })),
}));
