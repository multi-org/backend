
export interface AvailabilityDate{
    date: string;
    isAvailability: boolean;
    availableHours?: string[];
    price?: number;
    reason?: string;
}

export interface AvailabilityOptions {
  startDate?: string;
  endDate?: string;
  includeHours?: boolean;
}
