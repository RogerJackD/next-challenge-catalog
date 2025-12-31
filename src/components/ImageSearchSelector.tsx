// components/ImageSearchSelector.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { imagesService } from '../services/images-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageSearchSelectorProps {
  onImageSelect: (imageUrl: string) => void;
  onFileSelect: (file: File) => void;
  defaultSearchTerm?: string;
  disabled?: boolean;
}

export const ImageSearchSelector = ({
  onImageSelect,
  onFileSelect,
  defaultSearchTerm = '',
  disabled = false,
}: ImageSearchSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const result = await imagesService.searchImages(searchTerm, 6);
      setSearchResults(result.images);
      setSelectedImageUrl(null);
    } catch (error) {
      console.error('Error buscando imágenes:', error);
      alert('Error al buscar imágenes. Por favor intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    onImageSelect(imageUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Tabs defaultValue="google" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="google">Buscar en Google</TabsTrigger>
        <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
      </TabsList>

      <TabsContent value="google" className="space-y-4">
        {/* Buscador */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar imágenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={disabled || isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={disabled || isSearching || !searchTerm.trim()}
            size="icon"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Resultados */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {searchResults.map((imageUrl, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImageUrl === imageUrl
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => handleImageClick(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Resultado ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                  }}
                />
                {selectedImageUrl === imageUrl && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Busca imágenes para tu producto</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full h-32"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            <span>Seleccionar archivo desde tu computadora</span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WebP, GIF (Máx. 5MB)
            </span>
          </div>
        </Button>
      </TabsContent>
    </Tabs>
  );
};