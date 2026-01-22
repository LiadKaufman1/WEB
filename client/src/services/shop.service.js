import apiClient from "./apiClient";

export const shopService = {
    buyItem: async (username, itemCost, itemName) => {
        return apiClient.post("/shop/buy", { username, itemCost, itemName });
    }
};
