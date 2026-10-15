import {create} from 'zustand';

interface SiteHeaderState {
  isHome: boolean;
  setIsHome: (isHome: boolean) => void;
}

export const useSiteHeaderStore = create<SiteHeaderState>(set => ({
  isHome: false,
  setIsHome: isHome => set({isHome}),
}));
