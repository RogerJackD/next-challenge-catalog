import React, { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
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
import { CreateProductDto } from "../types/product"; // Asegúrate de importar el tipo

interface AddProductDialogProps {
  families: FamilyProduct[];
}

export const AddProductDialog = ({ families }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProduct | null>(
    null
  );
  const [searchFamily, setSearchFamily] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [codeProduct, setCodeProduct] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFamilies = useMemo(() => {
    if (!searchFamily) return families;
    return families.filter((family) =>
      family.nombreFamilia.toLowerCase().includes(searchFamily.toLowerCase())
    );
  }, [families, searchFamily]);

  const handleSubmit = async () => {
    // Validación
    if (!productName || !selectedFamily || !price || !codeProduct) {
      console.error("Todos los campos son requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const createProductData: CreateProductDto = {
        codigoMercaderia: codeProduct,
        nombre: productName,
        familiaProducto: selectedFamily.idFamiliaProducto, // Aquí usamos el ID
        precio: parseFloat(price),
      };

      const result = await productService.createProduct(createProductData);
      console.log("Producto creado exitosamente:", result);

      // Reset form
      setProductName("");
      setPrice("");
      setSelectedFamily(null);
      setSearchFamily("");
      setCodeProduct("");
      setOpen(false);
    } catch (error) {
      console.error("Error al crear el producto:", error);
    } finally {
      setIsSubmitting(false);
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