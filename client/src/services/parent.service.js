import apiClient from "./apiClient";

export const parentService = {
    createChild: async (parentId, childData) => {
        return apiClient.post('/child', childData, {
            headers: { 'x-user-id': parentId }
        });
    },

    getChildren: async (parentId) => {
        return apiClient.get('/children', {
            headers: { 'x-user-id': parentId }
        });
    }
};
