// services/images-service.ts

export interface ImageSearchResult {
  images: string[];
  count: number;
  searchTerm: string;
}

export interface ImageDownloadResult {
  message: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  originalUrl: string;
}

export const imagesService = {
 
  searchImages: async (term: string, numResults: number = 5): Promise<ImageSearchResult> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/search-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ term, numResults }),
    });

    if (!response.ok) {
      throw new Error(`Error en la búsqueda de imágenes: ${response.status}`);
    }

    return response.json();
  },

  downloadImage: async (imageUrl: string, productId: number): Promise<ImageDownloadResult> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/download-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, productId }),
    });

    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.status}`);
    }

    return response.json();
  },
};