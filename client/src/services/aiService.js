import apiClient from "./apiClient";

export const fetchHint = async (num1, num2, operator) => {
    try {
        const data = await apiClient.post('/ai/hint', { num1, num2, operator });
        return data.hint;
    } catch (error) {
        console.error("Failed to fetch hint:", error);
        return null;
    }
};
