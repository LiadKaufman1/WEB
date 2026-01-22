import apiClient from "./apiClient";

export const userService = {
    getStats: async (username) => {
        return apiClient.post("/user/stats", { username });
    },
    updateScore: async (field, username, points) => {
        return apiClient.post(`/score/${field}`, { username, points });
    },
    getFieldFrequency: async (field, username) => {
        // Note: Original endpoint used GET and params/query
        // But apiClient.get appends to base URL.
        // We need to handle query params manually or update apiClient.
        // For now, constructing the URL string here.
        return apiClient.get(`/user/${field}-f?username=${username}`);
    }
};
