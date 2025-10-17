import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { toast } = useToast();

  const { data: cart, isLoading } = useQuery<any>({
    queryKey: ["/api/cart"],
    enabled: isOpen,
  });

  const { data: products } = useQuery<any>({
    queryKey: ["/api/products"],
    enabled: isOpen && !!cart?.items?.length,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await apiRequest("PUT", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre panier",
      });
    },
  });

  const cartItems = cart?.items || [];
  const enrichedItems = cartItems.map((item: any) => {
    const product = products?.find((p: any) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = enrichedItems.reduce((sum: number, item: any) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const shipping = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col" data-testid="cart-sidebar">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Panier ({cartItems.length})
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Votre panier est vide</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des produits pour commencer vos achats
            </p>
            <Button onClick={onClose} asChild data-testid="button-continue-shopping">
              <Link href="/shop">
                <a>Continuer mes achats</a>
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {enrichedItems.map((item: any) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.productId}`}
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || "https://via.placeholder.com/80"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product?.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {item.size && <span>Taille: {item.size}</span>}
                        {item.color && <span>• {item.color}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                productId: item.productId,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center" data-testid={`quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                productId: item.productId,
                                quantity: item.quantity + 1,
                              })
                            }
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItemMutation.mutate(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-sm" data-testid={`price-${item.productId}`}>
                        {((item.product?.salePrice || item.product?.price || 0) * item.quantity).toFixed(0)} DA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span data-testid="subtotal">{subtotal.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span data-testid="shipping">
                    {shipping === 0 ? "Gratuite" : `${shipping} DA`}
                  </span>
                </div>
                {subtotal < 5000 && (
                  <p className="text-xs text-muted-foreground">
                    Ajoutez {(5000 - subtotal).toFixed(0)} DA pour la livraison gratuite
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="total">{total.toFixed(0)} DA</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={onClose}
                asChild
                data-testid="button-checkout"
              >
                <Link href="/checkout">
                  <a>Procéder au paiement</a>
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
