import apiClient from "./apiClient";

export const parentService = {
    createChild: async (parentId, childData) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const res = await fetch(`${baseUrl}/child`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': parentId
            },
            body: JSON.stringify(childData)
        });
        return res.json();
    },

    getChildren: async (parentId) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const res = await fetch(`${baseUrl}/children`, {
            method: 'GET',
            headers: {
                'x-user-id': parentId
            }
        });
        return res.json();
    }
};
