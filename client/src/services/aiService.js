
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchHint = async (num1, num2, operator) => {
    try {
        const response = await fetch(`${API_URL}/ai/hint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num1, num2, operator }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.hint;
    } catch (error) {
        console.error("Failed to fetch hint:", error);
        return null;
    }
};
