import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products } = useQuery<any>({
    queryKey: ["/api/products", { search: searchQuery }],
    enabled: isOpen && searchQuery.length > 2,
  });

  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  const popularSearches = ["Robe", "Maquillage", "Parfum", "Accessoires"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0" data-testid="search-dialog">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {searchQuery.length === 0 ? (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recherches populaires
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <Button
                    key={term}
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery(term)}
                    data-testid={`button-popular-${term.toLowerCase()}`}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          ) : searchQuery.length > 2 && filteredProducts.length > 0 ? (
            <div className="space-y-2">
              {filteredProducts.map((product: any) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <a
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                    data-testid={`search-result-${product.id}`}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/48"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {parseFloat(product.salePrice || product.price).toFixed(0)} DA
                      </p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : searchQuery.length > 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun produit trouvé</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
