import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { FamilyProduct } from '../types/familyProducts';
import { Label } from '@/components/ui/label';

interface AddProductDialogProps {
  families: FamilyProduct[];
}

export const AddProductDialog = ({ families }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProduct | null>(null);
  const [searchFamily, setSearchFamily] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');

  const filteredFamilies = useMemo(() => {
    if (!searchFamily) return families;
    return families.filter(family =>
      family.nombreFamilia.toLowerCase().includes(searchFamily.toLowerCase())
    );
  }, [families, searchFamily]);

  const handleSubmit = () => {
    console.log('Producto a agregar:', {
      nombre: productName,
      familia: selectedFamily,
      precio: parseFloat(price)
    });
    // Aquí irá la lógica de POST cuando esté lista
    
    // Reset form
    setProductName('');
    setPrice('');
    setSelectedFamily(null);
    setSearchFamily('');
    setOpen(false);
  };

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
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              placeholder="Ej: Laptop HP 15"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
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
                >
                  {selectedFamily ? selectedFamily.nombreFamilia : "Seleccionar familia..."}
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
            <Label htmlFor="price">Precio (S/)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Agregar Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};