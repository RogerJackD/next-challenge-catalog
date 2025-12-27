export const productSercvice = {
    getProducts: async () => {
        // const response = await fetch('http://localhost:3000/api/products');
        // return response.json();

        const { exampleDataProducts } = await import('../data/dataproducts');
        return exampleDataProducts;
    }
};