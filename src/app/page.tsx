'use client'

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { productSercvice } from "../services/product-service";
import { Product } from "../types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "../components/ProductCard";
import { FamilyProduct } from "../types/familyProducts";
import { familyProductService } from "../services/familyProduct-service";
import { FamilyProductsSlider } from "../components/FamilyProductsSlider";
import { AddProductDialog } from "../components/AddProductDialog";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [familyProducts, setFamilyProducts] = useState<FamilyProduct[]>([])

    useEffect(() => {
      const handleFetchDataProducts = async () => {
        const dataProducts = await productSercvice.getProducts()
        setProducts(dataProducts)
      }
      handleFetchDataProducts()

      const handleFetchDataFamilyProducts = async () => {
        const dataFamilyProducts = await familyProductService.getFamilyProducts()
        setFamilyProducts(dataFamilyProducts);
      }
      handleFetchDataFamilyProducts()
    }, [])

    const handleFamilyClick = (family: FamilyProduct) => {
      console.log('Family selected:', family);
    }
    
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Catálogo</h1>
      
      <div className="flex gap-2 mb-8">
        <Input placeholder="Buscar productos..." />
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
        <AddProductDialog families={familyProducts} />
      </div>

      <FamilyProductsSlider 
        families={familyProducts}
        onFamilyClick={handleFamilyClick}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.idProducto} product={product} />
        ))}
      </div>
    </div>
  );
}