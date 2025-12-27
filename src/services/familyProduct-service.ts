export const familyProductService = {
    getFamilyProducts: async () => {
        // const response = await fetch('http://localhost:3000/api/products');
        // return response.json();

        const { exampleDataFamilyProducts } = await import('../data/dataFamilyProducts');
        return exampleDataFamilyProducts;
    }
};