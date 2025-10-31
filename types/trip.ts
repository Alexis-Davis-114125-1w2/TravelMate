export interface Trip {
  id: string;
  name: string;
  destination: string;
  dateI: string;
  dateF: string;
  participants: number;
  status: 'planning' | 'active' | 'completed';
  image?: string;
  description?: string;
  vehicle?: 'auto' | 'avion' | 'caminando';
  cost?: number;
  adminIds?: number[];
}

export interface TripStats {
  totalTrips: number;
  completedTrips: number;
  totalDays: number;
  favoriteDestination: string;
  totalParticipants: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
