import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { CheckCircle2, Package, CreditCard, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const shippingSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().min(10, "L'adresse doit contenir au moins 10 caractères"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().min(5, "Le code postal doit contenir 5 chiffres"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  const { data: cart } = useQuery<any>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<any>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated && !!cart?.items?.length,
  });

  const applyPromoMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/promo/validate", { code: promoCode });
      return result;
    },
    onSuccess: (data: any) => {
      setDiscount(data.discount);
      toast({
        title: "Code promo appliqué",
        description: `Réduction de ${data.discount} DA`,
      });
    },
    onError: () => {
      toast({
        title: "Code promo invalide",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (shippingData: any) => {
      const orderData = {
        userId: isAuthenticated,
        items: cart.items,
        totalAmount: total,
        shippingCost: shippingCost,
        discountAmount: discount,
        status: "pending",
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        shippingAddress: shippingData,
        promoCode: promoCode || null,
      };
      const result = await apiRequest("POST", "/api/orders", orderData);
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/order-confirmation/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
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

  const shippingCost = shippingMethod === "express" ? 800 : subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shippingCost - discount;

  const onSubmit = (data: z.infer<typeof shippingSchema>) => {
    setStep(2);
  };

  const handlePlaceOrder = () => {
    const shippingData = form.getValues();
    createOrderMutation.mutate(shippingData);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-serif text-2xl font-bold mb-4">Votre panier est vide</h2>
        <Button onClick={() => setLocation("/shop")} data-testid="button-back-to-shop">
          Continuer mes achats
        </Button>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Livraison", icon: MapPin },
    { number: 2, title: "Paiement", icon: CreditCard },
    { number: 3, title: "Confirmation", icon: CheckCircle2 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Finaliser ma commande</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step >= s.number ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${s.number}`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-sm mt-2 text-center">{s.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step > s.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card data-testid="shipping-form">
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-postal-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="mb-3 block">Mode de livraison</Label>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <RadioGroupItem value="standard" id="standard" data-testid="radio-standard" />
                          <Label htmlFor="standard" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">Livraison standard</p>
                              <p className="text-sm text-muted-foreground">3-7 jours ouvrables</p>
                            </div>
                          </Label>
                          <span className="font-semibold">{subtotal >= 5000 ? "Gratuite" : "500 DA"}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <RadioGroupItem value="express" id="express" data-testid="radio-express" />
                          <Label htmlFor="express" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">Livraison express</p>
                              <p className="text-sm text-muted-foreground">1-3 jours ouvrables</p>
                            </div>
                          </Label>
                          <span className="font-semibold">800 DA</span>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" data-testid="button-continue-payment">
                      Continuer vers le paiement
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card data-testid="payment-section">
              <CardHeader>
                <CardTitle>Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <p className="font-medium">Paiement à la livraison</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vous paierez en espèces au moment de la livraison de votre commande.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-shipping">
                    Retour
                  </Button>
                  <Button className="flex-1" onClick={handlePlaceOrder} data-testid="button-place-order">
                    Confirmer la commande
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {enrichedItems.map((item: any) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || "https://via.placeholder.com/64"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {((item.product?.salePrice || item.product?.price || 0) * item.quantity).toFixed(0)} DA
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span data-testid="summary-subtotal">{subtotal.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span data-testid="summary-shipping">
                    {shippingCost === 0 ? "Gratuite" : `${shippingCost} DA`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{discount} DA</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="summary-total">{total.toFixed(0)} DA</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  data-testid="input-promo-code"
                />
                <Button
                  variant="outline"
                  onClick={() => applyPromoMutation.mutate()}
                  disabled={!promoCode}
                  data-testid="button-apply-promo"
                >
                  Appliquer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
