import { create } from 'zustand';
import { Location } from '../types/location';

interface LocationState {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedLocation: null,
  setSelectedLocation: (location: Location) => set({ selectedLocation: location }),
}));

export default useLocationStore; 