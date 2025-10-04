import { create } from 'zustand';

interface AppState {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLocation: 'Dakar',
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
