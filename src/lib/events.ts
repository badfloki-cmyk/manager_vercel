import api from './api';

export interface Event {
    _id: string;
    title: string;
    description?: string;
    type: 'Training' | 'Match' | 'Event';
    date: string;
    location: string;
    meetingPoint?: string;
    meetingTime?: string;
    notes?: string;
    team: '1. Mannschaft' | '2. Mannschaft' | 'Both';
    attendance: {
        player: string;
        status: 'Confirmed' | 'Declined' | 'Pending';
    }[];
}

export const getEvents = async (team?: string, startDate?: string, endDate?: string) => {
    let url = `/events?team=${team || 'Both'}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
};

export const createEvent = async (data: Partial<Event>) => {
    const response = await api.post('/events', data);
    return response.data;
};

export const updateEvent = async (id: string, data: Partial<Event>) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
};

export const deleteEvent = async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
};

export const updateAttendance = async (eventId: string, playerId: string, status: string) => {
    const response = await api.post(`/events/${eventId}/attendance`, { playerId, status });
    return response.data;
};
