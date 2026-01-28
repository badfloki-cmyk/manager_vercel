import api from './api';

export interface Event {
    _id: string;
    title: string;
    description?: string;
    type: 'Training' | 'Match' | 'Event';
    date: string;
    location: string;
    team: '1. Mannschaft' | '2. Mannschaft' | 'Both';
    attendance: {
        player: string;
        status: 'Confirmed' | 'Declined' | 'Pending';
    }[];
}

export const getEvents = async (team?: string) => {
    const response = await api.get(`/events${team ? `?team=${team}` : ''}`);
    return response.data;
};

export const createEvent = async (data: Partial<Event>) => {
    const response = await api.post('/events', data);
    return response.data;
};

export const updateAttendance = async (eventId: string, playerId: string, status: string) => {
    const response = await api.post(`/events/${eventId}/attendance`, { playerId, status });
    return response.data;
};
