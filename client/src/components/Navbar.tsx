import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onCartOpen: () => void;
  onSearchOpen: () => void;
}

export function Navbar({ onCartOpen, onSearchOpen }: NavbarProps) {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cart } = useQuery<any>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: wishlist } = useQuery<any>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const cartItemsCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.productIds?.length || 0;

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/shop", label: "Boutique" },
    { href: "/new", label: "Nouveautés" },
    { href: "/sale", label: "Promotions" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <h1 className="font-serif text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Zinoucha
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-foreground/80"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchOpen}
              data-testid="button-search"
              className="hover-elevate"
            >
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative hover-elevate"
                data-testid="button-wishlist"
                asChild
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartOpen}
              className="relative hover-elevate"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-account" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
                className="hidden sm:flex"
                data-testid="button-login"
              >
                <a href="/api/login">Se connecter</a>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover-elevate"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium hover-elevate ${
                  location === link.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Button
                variant="default"
                size="sm"
                asChild
                className="w-full"
                data-testid="button-mobile-login"
              >
                <a href="/api/login">Se connecter</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
