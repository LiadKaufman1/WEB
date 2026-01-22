import apiClient from "./apiClient";

export const adminService = {
    getParentsData: async (password) => {
        return apiClient.post("/parents/data", { password });
    }
};
