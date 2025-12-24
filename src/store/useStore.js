import { create } from "zustand";

const useStore = create((set) => ({
  currentMonth: new Date().getMonth() + 1, // 1-12
  currentYear: new Date().getFullYear(),
  setMonth: (month) => set({ currentMonth: month }),
  setYear: (year) => set({ currentYear: year }),

  // Selection state for forms
  selectedType: "Debit",
  setSelectedType: (type) => set({ selectedType: type }),

  // Modal states
  isExpenseModalOpen: false,
  setExpenseModalOpen: (isOpen) => set({ isExpenseModalOpen: isOpen }),
}));

export default useStore;
