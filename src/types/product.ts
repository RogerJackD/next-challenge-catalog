export interface Product {
    idProducto: number;
    nombre: string;
    familiaProducto: string;
    precio: number;
    foto: string | null;
    fotoUrl?: string | null;
    fotoThumbnail?: string | null;
    fotoMedium?: string | null;
    fotoOriginal?: string | null;
}


export interface CreateProductDto {
    codigoMercaderia: string;
    nombre: string;
    FamiliaProducto: number;
    precio: number;
    image?: File;
    googleImageUrl?: string; // Nueva propiedad
}


export interface CreateProductResponse {
    message: string;
    producto: {
        id: number;
        codigoMercaderia: string;
        nombre: string;
        precio: number;
        foto: string | null;
        fotoUrl: string | null;
        fotoThumbnail?: string | null;
        fotoMedium?: string | null;
        fotoOriginal?: string | null;
    };
}


export interface UpdateProductDto {
    nombre?: string;
    FamiliaProducto?: number;
    precio?: number;
    image?: File; 
}


export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}