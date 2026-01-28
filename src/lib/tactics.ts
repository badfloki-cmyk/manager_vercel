import api from './api';

export interface TacticData {
    _id?: string;
    name: string;
    mode: 'football' | 'futsal';
    formation: string;
    players: {
        id: string;
        name: string;
        number: number;
        x: number;
        y: number;
        color: string;
        photoUrl?: string;
    }[];
    drawingData?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const getTactics = async () => {
    const response = await api.get('/tactics');
    return response.data;
};

export const createTactic = async (data: TacticData) => {
    const response = await api.post('/tactics', data);
    return response.data;
};

export const updateTactic = async (id: string, data: Partial<TacticData>) => {
    const response = await api.put(`/tactics/${id}`, data);
    return response.data;
};

export const deleteTactic = async (id: string) => {
    const response = await api.delete(`/tactics/${id}`);
    return response.data;
};
