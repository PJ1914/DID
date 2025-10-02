import { create } from 'zustand';

interface UiState {
    showTrustScoreHistory: boolean;
    setTrustScoreHistory: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTrustScoreHistory: false,
    setTrustScoreHistory: (value) => set({ showTrustScoreHistory: value })
}));
