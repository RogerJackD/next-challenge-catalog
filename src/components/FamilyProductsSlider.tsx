import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyProduct } from '../types/familyProducts';
import { Badge } from '@/components/ui/badge';

interface FamilyProductsSliderProps {
  families: FamilyProduct[];
  onFamilyClick?: (family: FamilyProduct) => void;
}

export const FamilyProductsSlider = ({ families, onFamilyClick }: FamilyProductsSliderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleFamilyClick = (family: FamilyProduct) => {
    setSelectedFamily(family.idFamiliaProducto);
    onFamilyClick?.(family);
  };

  return (
    <div className="relative group mb-8">
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {families.map((family) => (
          <Badge
            key={family.idFamiliaProducto}
            variant={selectedFamily === family.idFamiliaProducto ? "default" : "outline"}
            className={`
              cursor-pointer whitespace-nowrap px-6 py-2.5 text-sm font-medium
              transition-all duration-200 hover:scale-105
              ${selectedFamily === family.idFamiliaProducto 
                ? 'shadow-md' 
                : 'hover:bg-accent'
              }
            `}
            onClick={() => handleFamilyClick(family)}
          >
            {family.nombreFamilia}
          </Badge>
        ))}
      </div>

      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};