import React, { useState, useMemo, useEffect, useRef } from "react";

import { ImageSearchSelector } from './ImageSearchSelector';
import { imagesService } from '../services/images-service';

import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { FamilyProduct } from "../types/familyProducts";
import { Label } from "@/components/ui/label";
import { productService } from "../services/product-service";
import { CreateProductDto } from "../types/product";

interface AddProductDialogProps {
  families: FamilyProduct[];
  onProductCreated?: () => void;
}

export const AddProductDialog = ({ families, onProductCreated }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProduct | null>(null);
  const [searchFamily, setSearchFamily] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [codeProduct, setCodeProduct] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para la imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  //imagenes google estgados:
  const [selectedGoogleImageUrl, setSelectedGoogleImageUrl] = useState<string | null>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);



  const filteredFamilies = useMemo(() => {
    if (!searchFamily) return families;
    return families.filter((family) =>
      family.nombreFamilia.toLowerCase().includes(searchFamily.toLowerCase())
    );
  }, [families, searchFamily]);

  // Manejar selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async () => {
  if (!productName || !selectedFamily || !price || !codeProduct) {
    alert("Todos los campos son requeridos");
    return;
  }

  setIsSubmitting(true);

  try {
    const createProductData: CreateProductDto = {
      codigoMercaderia: codeProduct,
      nombre: productName,
      FamiliaProducto: selectedFamily.idFamiliaProducto,
      precio: parseFloat(price),
      image: selectedImage || undefined,
      googleImageUrl: selectedGoogleImageUrl || undefined, // Incluir URL de Google
    };

    await productService.createProduct(createProductData);
    console.log("Producto creado exitosamente");

    // Reset form...
    setProductName("");
    setPrice("");
    setSelectedFamily(null);
    setSearchFamily("");
    setCodeProduct("");
    handleRemoveImage();
    setOpen(false);

    onProductCreated?.();
    
  } catch (error) {
    console.error("Error al crear el producto:", error);
    alert("Error al crear el producto. Por favor intenta de nuevo.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleGoogleImageSelect = (imageUrl: string) => {
  setSelectedGoogleImageUrl(imageUrl);
  setImagePreview(imageUrl);
  setSelectedImage(null); // Limpiar archivo local si había
};

const handleFileSelect = (file: File) => {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido');
    return;
  }

  // Validar tamaño
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. Máximo 5MB');
    return;
  }

  setSelectedImage(file);
  setSelectedGoogleImageUrl(null); // Limpiar URL de Google si había
  
  // Crear preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

// Actualizar handleRemoveImage:
const handleRemoveImage = () => {
  setSelectedImage(null);
  setImagePreview(null);
  setSelectedGoogleImageUrl(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};



  useEffect(() => {
    if (open) {
      const handleFetchDataProducts = async () => {
        setLoadingCode(true);
        try {
          const dataCodeProduct = await productService.getCodeProduct();
          setCodeProduct(dataCodeProduct.codigo);
        } finally {
          setLoadingCode(false);
        }
      };

      handleFetchDataProducts();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Producto</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo producto
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="codeProduct">Código</Label>
            <Input
              id="codeProduct"
              placeholder={loadingCode ? "Cargando..." : "Código generado"}
              value={codeProduct}
              disabled={loadingCode}
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              placeholder="ej: Pollo a la brasa"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label>Familia de Producto</Label>
            <Popover open={familyOpen} onOpenChange={setFamilyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={familyOpen}
                  className="justify-between"
                  disabled={isSubmitting}
                >
                  {selectedFamily
                    ? selectedFamily.nombreFamilia
                    : "Seleccionar familia..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar familia..."
                    value={searchFamily}
                    onValueChange={setSearchFamily}
                  />
                  <CommandList>
                    <CommandEmpty>No se encontró ninguna familia.</CommandEmpty>
                    <CommandGroup>
                      {filteredFamilies.map((family) => (
                        <CommandItem
                          key={family.idFamiliaProducto}
                          value={family.nombreFamilia}
                          onSelect={() => {
                            setSelectedFamily(family);
                            setFamilyOpen(false);
                            setSearchFamily("");
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFamily?.idFamiliaProducto ===
                              family.idFamiliaProducto
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {family.nombreFamilia}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Precio (S/)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Sección de imagen */}
          
{/* Sección de imagen */}
<div className="grid gap-2">
  <Label>Imagen del Producto (Opcional)</Label>
  
  {imagePreview ? (
    <div className="relative">
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2"
        onClick={handleRemoveImage}
        disabled={isSubmitting}
      >
        <X className="w-4 h-4" />
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        {selectedGoogleImageUrl ? 'Imagen de Google seleccionada' : 'Archivo local seleccionado'}
      </p>
    </div>
  ) : (
    <ImageSearchSelector
      onImageSelect={handleGoogleImageSelect}
      onFileSelect={handleFileSelect}
      defaultSearchTerm={productName}
      disabled={isSubmitting}
    />
  )}
</div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting || !productName || !selectedFamily || !price}
          >
            {isSubmitting ? "Agregando..." : "Agregar Producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};