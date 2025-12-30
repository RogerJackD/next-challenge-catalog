'use client'

import { Search, Grid3x3, LayoutGrid, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PaginationMeta, Product } from "../types/product";
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
import { Pagination } from "../components/Pagination";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)
    const [familyProducts, setFamilyProducts] = useState<FamilyProduct[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [columns, setColumns] = useState<4 | 5 | 6>(4)
    const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12) // Puedes hacer esto configurable también

    const handleProductCreated = () => {
  // Refetch manteniendo el estado actual (página, filtros, etc.)
  if (selectedFamilyId) {
    fetchProductsByFamily(selectedFamilyId, currentPage)
  } else if (searchQuery.trim()) {
    searchProducts(searchQuery, currentPage)
  } else {
    fetchProducts(currentPage)
  }
}
    const fetchProducts = async (page: number = 1) => {
      setIsLoadingProducts(true)
      try {
        const response = await productService.getProducts(page, itemsPerPage)
        setProducts(Array.isArray(response.data) ? response.data : [])
        setPaginationMeta(response.meta)
        setCurrentPage(page)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setPaginationMeta(null)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    const fetchProductsByFamily = async (idFamily: number, page: number = 1) => {
      setIsLoadingProducts(true)
      try {
        const response = await productService.getProductsByIdFamily(idFamily, page, itemsPerPage)
        setProducts(Array.isArray(response.data) ? response.data : [])
        setPaginationMeta(response.meta)
        setCurrentPage(page)
      } catch (error) {
        console.error('Error fetching products by family:', error)
        setProducts([])
        setPaginationMeta(null)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    const searchProducts = async (query: string, page: number = 1) => {
  setIsLoadingProducts(true)
  try {
    // Pasar selectedFamilyId si existe
    const response = await productService.searchProducts(
      query, 
      page, 
      itemsPerPage,
      selectedFamilyId || undefined
    )
    setProducts(Array.isArray(response.data) ? response.data : [])
    setPaginationMeta(response.meta)
    setCurrentPage(page)
  } catch (error) {
    console.error('Error searching products:', error)
    setProducts([])
    setPaginationMeta(null)
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
  if (selectedFamilyId === family.idFamiliaProducto) {
    // Deseleccionar familia
    setSelectedFamilyId(null)
    // Si hay búsqueda activa, buscar sin filtro de familia
    if (searchQuery.trim()) {
      searchProducts(searchQuery, 1)
    } else {
      fetchProducts(1)
    }
  } else {
    // Seleccionar nueva familia
    setSelectedFamilyId(family.idFamiliaProducto)
    // Si hay búsqueda activa, buscar con el nuevo filtro de familia
    if (searchQuery.trim()) {
      searchProducts(searchQuery, 1)
    } else {
      fetchProductsByFamily(family.idFamiliaProducto, 1)
    }
  }
}

    const handleSearch = () => {
  if (searchQuery.trim()) {
    // Ya no limpiamos selectedFamilyId, así se puede buscar dentro de una familia
    searchProducts(searchQuery, 1)
  } else {
    // Si no hay búsqueda pero hay familia, mostrar productos de esa familia
    if (selectedFamilyId) {
      fetchProductsByFamily(selectedFamilyId, 1)
    } else {
      fetchProducts(1)
    }
  }
}


    const handleClearFilters = () => {
      setSelectedFamilyId(null)
      setSearchQuery("")
      fetchProducts(1)
    }

    const handlePageChange = (page: number) => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      if (selectedFamilyId) {
        fetchProductsByFamily(selectedFamilyId, page)
      } else if (searchQuery.trim()) {
        searchProducts(searchQuery, page)
      } else {
        fetchProducts(page)
      }
    }

    const handleProductImageClick = (product: Product) => {
      setSelectedProduct(product)
      setUpdateDialogOpen(true)
    }

    const handleProductUpdate = () => {
      // Mantener la página actual después de actualizar
      if (selectedFamilyId) {
        fetchProductsByFamily(selectedFamilyId, currentPage)
      } else if (searchQuery.trim()) {
        searchProducts(searchQuery, currentPage)
      } else {
        fetchProducts(currentPage)
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
        <AddProductDialog 
        families={familyProducts} 
        onProductCreated={handleProductCreated}
      />
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {selectedFamilyId && (
            <Badge variant="secondary" className="gap-1">
              {familyProducts.find(f => f.idFamiliaProducto === selectedFamilyId)?.nombreFamilia}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  setSelectedFamilyId(null)
                  fetchProducts(1)
                }}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: {searchQuery}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  setSearchQuery("")
                  fetchProducts(1)
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
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="text-muted-foreground">No se encontraron productos</div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={`grid ${getGridClass()} gap-4`}>
            {products.map((product) => (
              <ProductCard 
                key={product.idProducto} 
                product={product} 
                onImageClick={handleProductImageClick}
              />
            ))}
          </div>

          {paginationMeta && (
            <Pagination 
              meta={paginationMeta}
              onPageChange={handlePageChange}
            />
          )}
        </>
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