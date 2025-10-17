import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inscription réussie!",
      description: "Vous recevrez bientôt nos dernières nouveautés et offres exclusives.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Zinoucha
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Votre destination en Algérie pour la mode féminine, le maquillage et les parfums de luxe.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop?category=vetements"><a className="hover:text-primary transition-colors" data-testid="link-footer-clothes">Vêtements</a></Link></li>
              <li><Link href="/shop?category=maquillage"><a className="hover:text-primary transition-colors" data-testid="link-footer-makeup">Maquillage</a></Link></li>
              <li><Link href="/shop?category=parfums"><a className="hover:text-primary transition-colors" data-testid="link-footer-perfumes">Parfums</a></Link></li>
              <li><Link href="/new"><a className="hover:text-primary transition-colors" data-testid="link-footer-new">Nouveautés</a></Link></li>
              <li><Link href="/sale"><a className="hover:text-primary transition-colors" data-testid="link-footer-sale">Promotions</a></Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-about">À propos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-contact">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-shipping">Livraison</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-returns">Retours</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">Confidentialité</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Inscrivez-vous pour recevoir 10% de réduction sur votre première commande
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter"
                className="bg-background"
              />
              <Button type="submit" className="w-full" data-testid="button-newsletter-submit">
                <Mail className="h-4 w-4 mr-2" />
                S'inscrire
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Zinoucha. Tous droits réservés.</p>
          <div className="mt-2 flex justify-center items-center space-x-2 text-xs">
            <span>Paiement à la livraison</span>
            <span>•</span>
            <span>Livraison gratuite dès 5000 DA</span>
            <span>•</span>
            <span>Retours sous 15 jours</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
