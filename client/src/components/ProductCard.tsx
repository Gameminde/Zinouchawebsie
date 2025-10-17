import { Link } from "wouter";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Product } from "@shared/schema";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: wishlist } = useQuery<any>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlist?.productIds?.includes(product.id) || false;

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: product.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isInWishlist
          ? "Le produit a été retiré de votre liste de souhaits"
          : "Le produit a été ajouté à votre liste de souhaits",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        size: product.sizes?.[0] || null,
        color: product.colors?.[0] || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Ajouté au panier",
        description: `${product.name} a été ajouté à votre panier`,
      });
    },
  });

  const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = product.salePrice ? parseFloat(product.price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    toggleWishlistMutation.mutate();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card
        className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover-elevate active-elevate-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/400"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-gold text-white" data-testid={`badge-new-${product.id}`}>
                Nouveau
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" data-testid={`badge-sale-${product.id}`}>
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              className={`transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"} bg-white/90 backdrop-blur-sm hover-elevate`}
              onClick={handleWishlistClick}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current text-primary" : ""}`} />
            </Button>
          </div>

          {/* Quick actions on hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              variant="secondary"
              className="w-full bg-white/95 backdrop-blur-sm hover-elevate"
              onClick={handleAddToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate" data-testid={`text-product-name-${product.id}`}>
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg" data-testid={`text-price-${product.id}`}>
              {price.toFixed(0)} DA
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice.toFixed(0)} DA
              </span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-destructive">Plus que {product.stock} en stock</p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-muted-foreground">Rupture de stock</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
