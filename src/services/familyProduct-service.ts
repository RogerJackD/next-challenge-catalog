export const familyProductService = {
    getFamilyProducts: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/families`);
        return response.json();
    }
};