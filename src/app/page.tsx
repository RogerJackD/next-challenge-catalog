'use client'

import { Search, Grid3x3, LayoutGrid, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "../components/ProductCard";
import { FamilyProduct } from "../types/familyProducts";
import { familyProductService } from "../services/familyProduct-service";
import { FamilyProductsSlider } from "../components/FamilyProductsSlider";
import { AddProductDialog } from "../components/AddProductDialog";
import { UpdateProductDialog } from "../components/UpdateProductDialog";
import { productService } from "../services/product-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [familyProducts, setFamilyProducts] = useState<FamilyProduct[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [columns, setColumns] = useState<4 | 5 | 6>(4)
    const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const dataProducts = await productService.getProducts()
        setProducts(dataProducts)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    const fetchProductsByFamily = async (idFamily: number) => {
      setIsLoadingProducts(true)
      try {
        const dataProducts = await productService.getProductsByIdFamily(idFamily)
        setProducts(dataProducts)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    const searchProducts = async (query: string) => {
      setIsLoadingProducts(true)
      try {
        const dataProducts = await productService.getProducts()
        const filtered = dataProducts.filter(product => 
          product.nombre.toLowerCase().includes(query.toLowerCase())
        )
        setProducts(filtered)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    useEffect(() => {
      fetchProducts()

      const handleFetchDataFamilyProducts = async () => {
        const dataFamilyProducts = await familyProductService.getFamilyProducts()
        setFamilyProducts(dataFamilyProducts);
      }
      handleFetchDataFamilyProducts()
    }, [])

    const handleFamilyClick = (family: FamilyProduct) => {
      // Si ya está seleccionada, deseleccionar
      if (selectedFamilyId === family.idFamiliaProducto) {
        setSelectedFamilyId(null)
        setSearchQuery("")
        fetchProducts()
      } else {
        setSelectedFamilyId(family.idFamiliaProducto)
        setSearchQuery("")
        fetchProductsByFamily(family.idFamiliaProducto)
      }
    }

    const handleSearch = () => {
      if (searchQuery.trim()) {
        setSelectedFamilyId(null)
        searchProducts(searchQuery)
      } else {
        fetchProducts()
      }
    }

    const handleClearFilters = () => {
      setSelectedFamilyId(null)
      setSearchQuery("")
      fetchProducts()
    }

    const handleProductImageClick = (product: Product) => {
      setSelectedProduct(product)
      setUpdateDialogOpen(true)
    }

    const handleProductUpdate = () => {
      // Mantener el filtro actual después de actualizar
      if (selectedFamilyId) {
        fetchProductsByFamily(selectedFamilyId)
      } else if (searchQuery.trim()) {
        searchProducts(searchQuery)
      } else {
        fetchProducts()
      }
    }

    const getGridClass = () => {
      switch(columns) {
        case 4:
          return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        case 5:
          return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        case 6:
          return "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
        default:
          return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }
    }

    const hasActiveFilters = selectedFamilyId !== null || searchQuery.trim() !== ""
    
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setColumns(4)}>
              <Grid3x3 className="w-4 h-4 mr-2" />
              4 Columnas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColumns(5)}>
              <Grid3x3 className="w-4 h-4 mr-2" />
              5 Columnas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColumns(6)}>
              <Grid3x3 className="w-4 h-4 mr-2" />
              6 Columnas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex gap-2 mb-6">
        <Input 
          placeholder="Buscar productos..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
        <AddProductDialog families={familyProducts} />
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {selectedFamilyId && (
            <Badge variant="secondary" className="gap-1">
              {familyProducts.find(f => f.idFamiliaProducto === selectedFamilyId)?.nombreFamilia}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  setSelectedFamilyId(null)
                  fetchProducts()
                }}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: &quot;{searchQuery}&quot;
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  setSearchQuery("")
                  fetchProducts()
                }}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      <div className="mb-8">
        <FamilyProductsSlider 
          families={familyProducts}
          onFamilyClick={handleFamilyClick}
          selectedFamilyId={selectedFamilyId}
        />
      </div>

      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Cargando productos...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="text-muted-foreground">No se encontraron productos</div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {products.map((product) => (
            <ProductCard 
              key={product.idProducto} 
              product={product} 
              onImageClick={handleProductImageClick}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <UpdateProductDialog
          product={selectedProduct}
          families={familyProducts}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
}