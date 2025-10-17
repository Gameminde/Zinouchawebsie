import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "wouter";
import { ShoppingBag, Heart, Package, LogOut } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredProducts } = useQuery<any>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: newProducts } = useQuery<any>({
    queryKey: ["/api/products", { isNew: true }],
  });

  const { data: orders } = useQuery<any>({
    queryKey: ["/api/orders"],
  });

  const quickLinks = [
    { icon: ShoppingBag, label: "Boutique", href: "/shop", color: "text-primary" },
    { icon: Heart, label: "Favoris", href: "/wishlist", color: "text-pink-500" },
    { icon: Package, label: "Commandes", href: "/account/orders", color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary/10 to-gold/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Bienvenue, {user?.firstName || "Chère cliente"} 👋
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Découvrez nos nouvelles collections et profitez d'offres exclusives
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild data-testid="button-shop-now">
                <Link href="/shop">
                  <a>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Découvrir
                  </a>
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild data-testid="button-logout">
                <a href="/api/logout">
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="hover-elevate active-elevate-2 transition-all" data-testid={`quick-link-${link.label.toLowerCase()}`}>
                  <CardContent className="p-6 text-center">
                    <link.icon className={`h-8 w-8 mx-auto mb-2 ${link.color}`} />
                    <p className="font-medium">{link.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">Mes dernières commandes</h2>
              <Button variant="ghost" asChild data-testid="button-view-all-orders">
                <Link href="/account/orders">
                  <a>Voir tout</a>
                </Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {orders.slice(0, 3).map((order: any) => (
                <Card key={order.id} data-testid={`order-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Commande #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{parseFloat(order.totalAmount).toFixed(0)} DA</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts && newProducts.length > 0 && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Nouveautés</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Sélection du moment</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
