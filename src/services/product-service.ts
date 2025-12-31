import { CodeProduct } from "../types/codeProduct";
import { CreateProductDto, CreateProductResponse, PaginatedResponse, Product, UpdateProductDto } from "../types/product";

export const productService = {
  getProducts: async (
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalog/products?page=${page}&limit=${limit}`
    );
    return response.json();
  },

  getCodeProduct: async (): Promise<CodeProduct> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalog/generate-code`
    );
    return response.json();
  },

 createProduct: async (createProducto: CreateProductDto): Promise<CreateProductResponse> => {
    // SIEMPRE usar FormData (tanto para archivo como para Google URL)
    const formData = new FormData();
    
    formData.append('codigoMercaderia', createProducto.codigoMercaderia);
    formData.append('nombre', createProducto.nombre);
    formData.append('FamiliaProducto', createProducto.FamiliaProducto.toString());
    formData.append('precio', createProducto.precio.toString());
    
    // Si hay URL de Google, agregarla como string en FormData
    if (createProducto.googleImageUrl) {
        formData.append('googleImageUrl', createProducto.googleImageUrl);
    }
    
    // Si hay archivo local, agregarlo
    if (createProducto.image) {
        formData.append('image', createProducto.image);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/product`, {
        method: "POST",
        body: formData  // Sin headers, el navegador los configura automáticamente
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return response.json();
},
  updateProduct: async (
    idProduct: number,
    updateProductDto: UpdateProductDto
  ) => {
    const hasImage = updateProductDto.image instanceof File;

    let body: FormData | string;
    let headers: HeadersInit = {};

    if (hasImage) {
      // Usar FormData si hay imagen
      const formData = new FormData();

      if (updateProductDto.nombre !== undefined) {
        formData.append("nombre", updateProductDto.nombre);
      }
      if (updateProductDto.FamiliaProducto !== undefined) {
        formData.append(
          "FamiliaProducto",
          updateProductDto.FamiliaProducto.toString()
        );
      }
      if (updateProductDto.precio !== undefined) {
        formData.append("precio", updateProductDto.precio.toString());
      }
      if (updateProductDto.image) {
        formData.append("image", updateProductDto.image);
      }

      body = formData;
      // No establecer Content-Type, el navegador lo hará automáticamente
    } else {
      // Usar JSON si no hay imagen
      const { image, ...jsonData } = updateProductDto;
      body = JSON.stringify(jsonData);
      headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalog/product/${idProduct}`,
      {
        method: "PATCH",
        headers,
        body,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return response.json();
  },

  getProductsByIdFamily: async (
    idFamily: number,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalog/products?idFamiliaProducto=${idFamily}&page=${page}&limit=${limit}`
    );
    return response.json();
  },

  searchProducts: async (
    query: string, 
    page: number = 1, 
    limit: number = 12,
    idFamiliaProducto?: number
): Promise<PaginatedResponse<Product>> => {
    // Si no hay término de búsqueda, retornar vacío
    if (!query || query.trim() === '') {
        return {
            data: [],
            meta: {
                page,
                limit,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            }
        };
    }

    // Construir URL con parámetros
    let url = `${process.env.NEXT_PUBLIC_API_URL}/catalog/products/search?term=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    
    // Agregar filtro de familia si existe
    if (idFamiliaProducto) {
        url += `&idFamiliaProducto=${idFamiliaProducto}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status}`);
    }

    return response.json();
},
};