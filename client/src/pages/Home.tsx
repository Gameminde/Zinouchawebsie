import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "wouter";
import { ShoppingBag, Heart, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery<any>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: newProducts, isLoading: loadingNew } = useQuery<any>({
    queryKey: ["/api/products", { isNew: true }],
  });

  const { data: allProducts } = useQuery<any>({
    queryKey: ["/api/products"],
  });

  // Best sellers are products with sale prices (on promotion)
  const bestSellers = allProducts?.filter((p: any) => p.salePrice).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-gold/10 to-rose-powder/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 container mx-auto px-4 text-center animate-in fade-in-up anim-duration-1000">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {user ? `Bienvenue, ${user.firstName}` : 'Bienvenue chez Zinoucha'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez notre collection exclusive de vêtements, maquillage et parfums
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 hover-elevate active-elevate-2"
              asChild
              data-testid="button-shop-collection"
            >
              <Link href="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Voir la Collection
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 px-8 hover-elevate active-elevate-2"
              asChild
              data-testid="button-new-arrivals"
            >
              <Link href="/shop?new=true">
                <Sparkles className="h-5 w-5 mr-2" />
                Nouveautés
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats for authenticated users */}
      {user && (
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4">
              <Link href="/wishlist">
                <Card className="hover-elevate active-elevate-2 transition-all duration-300 animate-in fade-in anim-duration-500" data-testid="stat-wishlist">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Favoris</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/cart">
                <Card className="hover-elevate active-elevate-2 transition-all duration-300 animate-in fade-in anim-duration-500" style={{ animationDelay: '100ms' }} data-testid="stat-cart">
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gold" />
                    <p className="font-semibold text-sm">Panier</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/account/orders">
                <Card className="hover-elevate active-elevate-2 transition-all duration-300 animate-in fade-in anim-duration-500" style={{ animationDelay: '200ms' }} data-testid="stat-orders">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-rose" />
                    <p className="font-semibold text-sm">Commandes</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 animate-in fade-in-up anim-duration-700">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">Nouveautés</h2>
              <p className="text-muted-foreground">Les dernières tendances de la saison</p>
            </div>
            <Button variant="ghost" asChild data-testid="button-view-all-new">
              <Link href="/shop?new=true">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loadingNew ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-square rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : newProducts && newProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.slice(0, 4).map((product: any, index: number) => (
                <div 
                  key={product.id} 
                  className="animate-in fade-in-up anim-duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucune nouveauté pour le moment</p>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-br from-gold/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 animate-in fade-in-up anim-duration-700">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">Meilleures Ventes</h2>
                <p className="text-muted-foreground">Nos produits les plus populaires</p>
              </div>
              <Button variant="ghost" asChild data-testid="button-view-all-bestsellers">
                <Link href="/shop?sale=true">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product: any, index: number) => (
                <div 
                  key={product.id} 
                  className="animate-in fade-in-up anim-duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 animate-in fade-in-up anim-duration-700">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">Sélection du Moment</h2>
              <p className="text-muted-foreground">Notre collection soigneusement choisie pour vous</p>
            </div>
            <Button variant="ghost" asChild data-testid="button-view-all-featured">
              <Link href="/shop?featured=true">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-square rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product: any, index: number) => (
                <div 
                  key={product.id} 
                  className="animate-in fade-in-up anim-duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucun produit featured pour le moment</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary via-primary/90 to-gold text-white">
        <div className="container mx-auto px-4 text-center animate-in fade-in anim-duration-1000">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prête à trouver votre style ?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Explorez notre collection complète et profitez de nos promotions exclusives
          </p>
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90 px-8 hover-elevate active-elevate-2"
            asChild
            data-testid="button-cta-shop"
          >
            <Link href="/shop">
              Découvrir la Boutique
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
