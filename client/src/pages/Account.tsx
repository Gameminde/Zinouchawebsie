import { Link, useLocation, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function AccountLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder à cette page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: "Profil", href: "/account" },
    { icon: Package, label: "Mes commandes", href: "/account/orders" },
    { icon: MapPin, label: "Adresses", href: "/account/addresses" },
    { icon: Heart, label: "Favoris", href: "/account/wishlist" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        location === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  asChild
                  data-testid="button-logout"
                >
                  <a href="/api/logout">
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </a>
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}

function Profile() {
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-serif text-2xl font-bold mb-6">Mon profil</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
            <p className="text-lg">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Orders() {
  const { data: orders, isLoading } = useQuery<any>({
    queryKey: ["/api/orders"],
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Mes commandes</h2>
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} data-testid={`order-card-${order.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Commande #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img src={item.image || "https://via.placeholder.com/48"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">Qté: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 2} autres produits
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="font-semibold">Total: {parseFloat(order.totalAmount).toFixed(0)} DA</span>
                  <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                    Voir les détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Aucune commande pour le moment</p>
            <Button asChild data-testid="button-start-shopping">
              <Link href="/shop">
                <a>Commencer mes achats</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Wishlist() {
  const { data: wishlist, isLoading: wishlistLoading } = useQuery<any>({
    queryKey: ["/api/wishlist"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<any>({
    queryKey: ["/api/products"],
    enabled: !!wishlist?.productIds?.length,
  });

  const wishlistProducts = products?.filter((p: any) =>
    wishlist?.productIds?.includes(p.id)
  ) || [];

  if (wishlistLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Mes favoris</h2>
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Aucun favori pour le moment</p>
            <Button asChild data-testid="button-browse-products">
              <Link href="/shop">
                <a>Découvrir nos produits</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Account() {
  return (
    <AccountLayout>
      <Switch>
        <Route path="/account" component={Profile} />
        <Route path="/account/orders" component={Orders} />
        <Route path="/account/wishlist" component={Wishlist} />
        <Route path="/account/addresses">
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Gestion des adresses à venir</p>
            </CardContent>
          </Card>
        </Route>
      </Switch>
    </AccountLayout>
  );
}
