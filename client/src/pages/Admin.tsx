import { Link, useLocation, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/admin" },
    { icon: Package, label: "Produits", href: "/admin/products" },
    { icon: ShoppingCart, label: "Commandes", href: "/admin/orders" },
    { icon: Users, label: "Clients", href: "/admin/customers" },
    { icon: Tag, label: "Codes promo", href: "/admin/promo-codes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-xl font-bold">Admin - Zinoucha</h1>
          </div>
          <Button variant="outline" size="sm" asChild data-testid="button-back-to-site">
            <Link href="/">
              <a>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au site
              </a>
            </Link>
          </Button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <aside className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          location === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        data-testid={`link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </a>
                    </Link>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>
          <div className="md:col-span-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentOrders } = useQuery<any>({
    queryKey: ["/api/orders", { limit: 5 }],
  });

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl font-bold">Tableau de bord</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-revenue">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.revenue?.toFixed(0) || 0} DA</div>
          </CardContent>
        </Card>
        <Card data-testid="stat-orders">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card data-testid="stat-products">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        <Card data-testid="stat-customers">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{parseFloat(order.totalAmount).toFixed(0)} DA</p>
                    <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">Aucune commande récente</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Products() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery<any>({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit supprimé",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProduct) {
        await apiRequest("PUT", `/api/products/${editingProduct.id}`, data);
      } else {
        await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: editingProduct ? "Produit modifié" : "Produit créé",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      salePrice: formData.get("salePrice") || null,
      category: formData.get("category"),
      brand: formData.get("brand"),
      stock: Number(formData.get("stock")),
      sizes: formData.get("sizes")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [],
      colors: formData.get("colors")?.toString().split(",").map(c => c.trim()).filter(Boolean) || [],
      images: formData.get("images")?.toString().split(",").map(i => i.trim()).filter(Boolean) || [],
      featured: formData.get("featured") === "on",
      isNew: formData.get("isNew") === "on",
    };
    createProductMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold">Produits</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)} data-testid="button-add-product">
              <Package className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" required defaultValue={editingProduct?.name} data-testid="input-product-name" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required defaultValue={editingProduct?.description} data-testid="input-product-description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prix (DA)</Label>
                  <Input id="price" name="price" type="number" required defaultValue={editingProduct?.price} data-testid="input-product-price" />
                </div>
                <div>
                  <Label htmlFor="salePrice">Prix promo (DA)</Label>
                  <Input id="salePrice" name="salePrice" type="number" defaultValue={editingProduct?.salePrice} data-testid="input-product-sale-price" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select name="category" defaultValue={editingProduct?.category} required>
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vetements">Vêtements</SelectItem>
                      <SelectItem value="maquillage">Maquillage</SelectItem>
                      <SelectItem value="parfums">Parfums</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Marque</Label>
                  <Input id="brand" name="brand" defaultValue={editingProduct?.brand} data-testid="input-product-brand" />
                </div>
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" required defaultValue={editingProduct?.stock || 0} data-testid="input-product-stock" />
              </div>
              <div>
                <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
                <Input id="sizes" name="sizes" placeholder="S, M, L, XL" defaultValue={editingProduct?.sizes?.join(", ")} data-testid="input-product-sizes" />
              </div>
              <div>
                <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
                <Input id="colors" name="colors" placeholder="Noir, Blanc, Rose" defaultValue={editingProduct?.colors?.join(", ")} data-testid="input-product-colors" />
              </div>
              <div>
                <Label htmlFor="images">URLs des images (séparées par des virgules)</Label>
                <Textarea id="images" name="images" placeholder="https://..." defaultValue={editingProduct?.images?.join(", ")} data-testid="input-product-images" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" name="featured" defaultChecked={editingProduct?.featured} data-testid="checkbox-product-featured" />
                  <Label htmlFor="featured">En vedette</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isNew" name="isNew" defaultChecked={editingProduct?.isNew} data-testid="checkbox-product-new" />
                  <Label htmlFor="isNew">Nouveau</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-product">
                {editingProduct ? "Modifier" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products?.map((product: any) => (
            <Card key={product.id} data-testid={`admin-product-${product.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.images?.[0] || "https://via.placeholder.com/80"}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold">{parseFloat(product.price).toFixed(0)} DA</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-${product.id}`}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      data-testid={`button-delete-${product.id}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders() {
  const { toast } = useToast();
  const { data: orders, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Statut mis à jour",
      });
    },
  });

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "processing", label: "En préparation" },
    { value: "shipped", label: "Expédiée" },
    { value: "delivered", label: "Livrée" },
    { value: "cancelled", label: "Annulée" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl font-bold">Commandes</h2>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: any) => (
            <Card key={order.id} data-testid={`admin-order-${order.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Commande #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ orderId: order.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-40" data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="font-semibold">{parseFloat(order.totalAmount).toFixed(0)} DA</span>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>Client:</strong> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p><strong>Téléphone:</strong> {order.shippingAddress?.phone}</p>
                  <p><strong>Adresse:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/products" component={Products} />
        <Route path="/admin/orders" component={Orders} />
        <Route path="/admin/customers">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Gestion des clients à venir</p>
            </CardContent>
          </Card>
        </Route>
        <Route path="/admin/promo-codes">
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Gestion des codes promo à venir</p>
            </CardContent>
          </Card>
        </Route>
      </Switch>
    </AdminLayout>
  );
}
