import { create } from 'zustand';

interface ProfileState {
  member: {
    memberId: number;
    memberName?: string;
    email: string;
    designation: number;
    isRecruiter: boolean;
  } | null;
  isSidebarOpen: boolean;
  setProfile: (member: any) => void;
  clearProfile: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  member: null,
  isSidebarOpen: false,
  setProfile: (member) => set({ member }),
  clearProfile: () => set({ member: null }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));