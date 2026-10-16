import {create} from 'zustand';

interface TabBarCollapseState {
  /** True while the floating tab bar is in its compact icon-only form. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const useTabBarCollapseStore = create<TabBarCollapseState>(set => ({
  collapsed: false,
  setCollapsed: collapsed => set({collapsed}),
}));
