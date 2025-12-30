import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, Upload, X, Trash2 } from 'lucide-react';
import { Product, UpdateProductDto } from '../types/product';
import { FamilyProduct } from '../types/familyProducts';
import { productService } from '../services/product-service';

interface UpdateProductDialogProps {
  product: Product;
  families: FamilyProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const UpdateProductDialog = ({
  product,
  families,
  open,
  onOpenChange,
  onUpdate,
}: UpdateProductDialogProps) => {
  const [productName, setProductName] = useState(product.nombre);
  const [price, setPrice] = useState(product.precio.toString());
  const [familyOpen, setFamilyOpen] = useState(false);
  const [searchFamily, setSearchFamily] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<FamilyProduct | null>(
    () => families.find(f => f.nombreFamilia === product.familiaProducto) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para manejo de imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keepCurrentImage, setKeepCurrentImage] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFamilies = useMemo(() => {
    if (!searchFamily) return families;
    return families.filter((family) =>
      family.nombreFamilia.toLowerCase().includes(searchFamily.toLowerCase())
    );
  }, [families, searchFamily]);

  // URL de la imagen actual del producto
  const currentImageUrl = product.fotoMedium 
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.fotoMedium}`
    : null;

  // Manejar selección de nueva imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
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
      setKeepCurrentImage(false);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover nueva imagen seleccionada
  const handleRemoveNewImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setKeepCurrentImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const updateData: UpdateProductDto = {};

      // Solo incluir campos que hayan cambiado
      if (productName !== product.nombre) {
        updateData.nombre = productName;
      }
      if (selectedFamily && selectedFamily.nombreFamilia !== product.familiaProducto) {
        updateData.FamiliaProducto = selectedFamily.idFamiliaProducto;
      }
      if (parseFloat(price) !== product.precio) {
        updateData.precio = parseFloat(price);
      }

      // Si hay una nueva imagen seleccionada, agregarla
      if (selectedImage) {
        updateData.image = selectedImage;
      }

      console.log('Actualizando producto:', updateData);
      
      await productService.updateProduct(product.idProducto, updateData);
      
      onUpdate(); // Trigger refetch
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alert('Error al actualizar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      setProductName(product.nombre);
      setPrice(product.precio.toString());
      setSelectedFamily(
        families.find(f => f.nombreFamilia === product.familiaProducto) || null
      );
      setSearchFamily('');
      setFamilyOpen(false);
      
      // Reset imagen
      setSelectedImage(null);
      setImagePreview(null);
      setKeepCurrentImage(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, product, families]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Actualiza la información del producto
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Sección de Imagen */}
          <div className="grid gap-2">
            <Label>Imagen del Producto</Label>
            
            {/* Mostrar imagen actual o nueva */}
            {imagePreview ? (
              // Preview de nueva imagen
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Nueva imagen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveNewImage}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Nueva imagen seleccionada
                </p>
              </div>
            ) : currentImageUrl && keepCurrentImage ? (
              // Imagen actual
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={currentImageUrl}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Imagen actual
                </p>
              </div>
            ) : (
              // Sin imagen
              <div className="w-full h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg 
                    className="w-12 h-12 text-gray-400 mx-auto mb-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
              </div>
            )}

            {/* Botón para cambiar imagen */}
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="update-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {currentImageUrl ? 'Cambiar Imagen' : 'Agregar Imagen'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos: JPG, PNG, WebP, GIF (Máx. 5MB)
            </p>
          </div>

          {/* Campos de texto */}
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nombre del Producto</Label>
            <Input
              id="edit-name"
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
                            setSearchFamily('');
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFamily?.idFamiliaProducto === family.idFamiliaProducto
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
            <Label htmlFor="edit-price">Precio (S/)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};