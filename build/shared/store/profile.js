import { create } from 'zustand';
export const useProfileStore = create((set) => ({
    member: null,
    isSidebarOpen: false,
    setProfile: (member) => set({ member }),
    clearProfile: () => set({ member: null }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),
}));
