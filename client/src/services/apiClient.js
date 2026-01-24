const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = {
    get: async (url, options = {}) => {
        const res = await fetch(`${API_BASE_URL}${url}`, options);
        return res.json();
    },
    post: async (url, body, options = {}) => {
        const res = await fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...options.headers },
            body: JSON.stringify(body),
            ...options
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Server Error ${res.status}: ${text || res.statusText}`);
        }

        try {
            return await res.json();
        } catch (err) {
            throw new Error("Response was not valid JSON (Empty or HTML?)");
        }
    }
};

export default apiClient;
