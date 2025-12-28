import { CodeProduct } from "../types/codeProduct";

export const productService = {
    getProducts: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/products`);
        return response.json();
    },

    getCodeProduct: async (): Promise<CodeProduct> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/generate-code`);
        return response.json();
    } 
};