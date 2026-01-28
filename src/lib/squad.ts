import api from './api';

export interface Player {
    _id: string;
    firstName: string;
    lastName: string;
    number: number;
    position: string;
    team: '1. Mannschaft' | '2. Mannschaft';
    status: 'Active' | 'Injured' | 'Away';
    role: 'Captain' | 'Regular';
    photoUrl?: string;
    onBench: boolean;
    stats: {
        goals: number;
        assists: number;
        appearances: number;
    };
}

export const getPlayers = async (team?: string) => {
    const response = await api.get(`/players${team ? `?team=${team}` : ''}`);
    return response.data;
};

export const createPlayer = async (data: Partial<Player>) => {
    const response = await api.post('/players', data);
    return response.data;
};

export const updatePlayer = async (id: string, data: Partial<Player>) => {
    const response = await api.put(`/players/${id}`, data);
    return response.data;
};

export const deletePlayer = async (id: string) => {
    const response = await api.delete(`/players/${id}`);
    return response.data;
};
