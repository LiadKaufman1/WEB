const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = {
    get: async (url) => {
        const res = await fetch(`${API_BASE_URL}${url}`);
        return res.json();
    },
    post: async (url, body) => {
        const res = await fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return res.json();
    }
};

export default apiClient;
