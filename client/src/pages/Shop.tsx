import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";

export default function Shop() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "";

  const [filters, setFilters] = useState({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 50000,
    sizes: [] as string[],
    colors: [] as string[],
    sort: "newest",
  });

  const { data: products, isLoading } = useQuery<any>({
    queryKey: ["/api/products", filters],
  });

  const categories = [
    { value: "vetements", label: "Vêtements" },
    { value: "maquillage", label: "Maquillage" },
    { value: "parfums", label: "Parfums" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = ["Noir", "Blanc", "Rose", "Bleu", "Rouge", "Beige"];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 50000,
      sizes: [],
      colors: [],
      sort: "newest",
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Catégorie</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-2">
              <Checkbox
                id={cat.value}
                checked={filters.category === cat.value}
                onCheckedChange={() =>
                  handleFilterChange("category", filters.category === cat.value ? "" : cat.value)
                }
                data-testid={`checkbox-category-${cat.value}`}
              />
              <Label htmlFor={cat.value} className="cursor-pointer">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="space-y-4">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => {
              handleFilterChange("minPrice", min);
              handleFilterChange("maxPrice", max);
            }}
            max={50000}
            step={500}
            className="my-4"
            data-testid="slider-price"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="text-min-price">{filters.minPrice} DA</span>
            <span data-testid="text-max-price">{filters.maxPrice} DA</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Taille</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={filters.sizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => handleSizeToggle(size)}
              data-testid={`button-size-${size}`}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Couleur</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <Button
              key={color}
              variant={filters.colors.includes(color) ? "default" : "outline"}
              size="sm"
              onClick={() => handleColorToggle(color)}
              data-testid={`button-color-${color.toLowerCase()}`}
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
        data-testid="button-clear-filters"
      >
        <X className="h-4 w-4 mr-2" />
        Réinitialiser
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <h2 className="font-serif text-2xl font-bold mb-6">Filtres</h2>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-mobile-filters">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-3xl font-bold">
              {filters.category
                ? categories.find((c) => c.value === filters.category)?.label
                : "Tous les produits"}
            </h1>
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Nouveautés</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="popular">Popularité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Aucun produit trouvé avec ces filtres
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
