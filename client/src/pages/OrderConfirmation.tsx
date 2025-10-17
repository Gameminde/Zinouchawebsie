import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, MapPin, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function OrderConfirmation() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ["/api/orders", id],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4">Commande non trouvée</h2>
        <Button asChild>
          <Link href="/"><a>Retour à l'accueil</a></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Commande confirmée !
          </h1>
          <p className="text-muted-foreground">
            Merci pour votre commande. Vous recevrez une confirmation par email.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de commande</p>
                <p className="font-semibold text-lg" data-testid="order-number">#{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold text-2xl text-primary" data-testid="order-total">
                  {parseFloat(order.totalAmount).toFixed(0)} DA
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Vos produits</p>
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image || "https://via.placeholder.com/48"}
                          alt={item.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qté: {item.quantity} × {item.price} DA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Adresse de livraison</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                    {order.shippingAddress?.address}<br />
                    {order.shippingAddress?.city} {order.shippingAddress?.postalCode}<br />
                    Tél: {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Mode de paiement</p>
                  <p className="text-sm text-muted-foreground">
                    Paiement à la livraison
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2">Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Vous recevrez un email de confirmation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Votre commande sera préparée sous 24-48h
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Livraison estimée: 3-7 jours ouvrables
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Vous paierez à la réception de votre colis
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" asChild data-testid="button-continue-shopping">
            <Link href="/shop">
              <a>Continuer mes achats</a>
            </Link>
          </Button>
          <Button className="flex-1" asChild data-testid="button-view-orders">
            <Link href="/account/orders">
              <a>Voir mes commandes</a>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
