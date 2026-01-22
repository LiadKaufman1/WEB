import apiClient from "./apiClient";

export const parentService = {
    createChild: async (parentId, childData) => {
        // We send parentId in header as implemented in backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/child`, {
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/children`, {
            method: 'GET',
            headers: {
                'x-user-id': parentId
            }
        });
        return res.json();
    }
};
