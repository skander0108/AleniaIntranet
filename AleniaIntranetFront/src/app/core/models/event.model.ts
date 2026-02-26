export interface Event {
    id: string;
    title: string;
    eventDate: string; // ISO date string
    eventTime: string; // HH:mm format
    location: string;
    isRegistered: boolean;
    description?: string;
    imageUrl?: string;
    registrationCount: number;
}
