import apiClient from "./apiClient";

export const authService = {
    checkLogin: async (username, password) => {
        return apiClient.post("/check-login", { username, password });
    },
    register: async (username, password, age) => {
        return apiClient.post("/register", { username, password, age });
    }
};
