import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, RefreshCw, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<any>({
    queryKey: ["/api/products", id],
  });

  const { data: reviews } = useQuery<any>({
    queryKey: ["/api/reviews", { productId: id }],
  });

  const { data: relatedProducts } = useQuery<any>({
    queryKey: ["/api/products", { category: product?.category, limit: 4 }],
    enabled: !!product,
  });

  const { data: wishlist } = useQuery<any>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlist?.productIds?.includes(id) || false;

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Retiré des favoris" : "Ajouté aux favoris",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: id,
        quantity,
        size: selectedSize || product?.sizes?.[0] || null,
        color: selectedColor || product?.colors?.[0] || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Ajouté au panier",
        description: `${product?.name} a été ajouté à votre panier`,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4">Produit non trouvé</h2>
        <Button asChild>
          <Link href="/shop"><a>Retour à la boutique</a></Link>
        </Button>
      </div>
    );
  }

  const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = product.salePrice ? parseFloat(product.price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const averageRating = reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (reviews?.length || 1) || 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({
        title: "Sélectionnez une taille",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/"><a className="hover:text-foreground transition-colors">Accueil</a></Link>
        <span>/</span>
        <Link href="/shop"><a className="hover:text-foreground transition-colors">Boutique</a></Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images?.[selectedImage] || "https://via.placeholder.com/600"}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="image-main-product"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 right-4 bg-gold text-white">
                Nouveau
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? "border-primary" : "border-transparent"
                }`}
                data-testid={`button-thumbnail-${idx}`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2" data-testid="text-product-name">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-muted-foreground">{product.brand}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating) ? "fill-gold text-gold" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews?.length || 0} avis)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-3xl" data-testid="text-product-price">
              {price.toFixed(0)} DA
            </span>
            {originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {originalPrice.toFixed(0)} DA
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    data-testid={`button-select-size-${size}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Couleur</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                    data-testid={`button-select-color-${color.toLowerCase()}`}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantité</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-testid="button-decrease-quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium w-12 text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.stock && quantity >= product.stock}
                data-testid="button-increase-quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-sm text-destructive mt-2">Plus que {product.stock} en stock</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = "/api/login";
                  return;
                }
                toggleWishlistMutation.mutate();
              }}
              data-testid="button-toggle-wishlist"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Features */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Livraison gratuite</p>
                  <p className="text-sm text-muted-foreground">Dès 5000 DA d'achat</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Retours faciles</p>
                  <p className="text-sm text-muted-foreground">Sous 15 jours</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Paiement sécurisé</p>
                  <p className="text-sm text-muted-foreground">Paiement à la livraison</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">Avis ({reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="shipping" data-testid="tab-shipping">Livraison & Retours</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            {product.category === "maquillage" && (
              <div className="mt-4">
                <h3>Ingrédients</h3>
                <p className="text-sm text-muted-foreground">
                  Produit de qualité premium avec ingrédients sélectionnés
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-2">{review.comment}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('fr-DZ')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun avis pour le moment</p>
          )}
        </TabsContent>
        <TabsContent value="shipping" className="mt-6">
          <div className="prose max-w-none">
            <h3>Livraison</h3>
            <p>Livraison gratuite en Algérie pour les commandes de 5000 DA et plus.</p>
            <p>Délai de livraison : 3 à 7 jours ouvrables selon votre wilaya.</p>
            <h3 className="mt-6">Retours</h3>
            <p>Retours gratuits sous 15 jours. Le produit doit être dans son état d'origine.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct: any) => (
              relatedProduct.id !== id && <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
