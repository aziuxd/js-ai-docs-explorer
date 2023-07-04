import { create } from "zustand";

type Models = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5";

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

interface SettingsState {
  model: Models;
  temperature: number;
  index: string;
  changeModel: (newModel: Models) => void;
  changeIndex: (newIndex: string) => void;
  changeTemperature: (newTemperature: number) => void;
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

export const useSettingsStore = create<SettingsState>((set) => ({
  model: "gpt-3.5-turbo-16k",
  temperature: 0.1,
  index: "documentazione",
  changeModel: (newModel) => set((state) => ({ model: newModel })),
  changeIndex: (newIndex) => set((state) => ({ index: newIndex })),
  changeTemperature: (newTemperature) =>
    set((state) => ({ temperature: newTemperature })),
}));
