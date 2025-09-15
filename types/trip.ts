export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  participants: number;
  status: 'planning' | 'active' | 'completed';
  image?: string;
  description?: string;
}

export interface TripStats {
  totalTrips: number;
  completedTrips: number;
  totalDays: number;
  favoriteDestination: string;
  totalParticipants: number;
}
