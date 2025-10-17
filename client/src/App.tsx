import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { SearchDialog } from "@/components/SearchDialog";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      {!window.location.pathname.startsWith('/admin') && (
        <Navbar onCartOpen={() => setIsCartOpen(true)} onSearchOpen={() => setIsSearchOpen(true)} />
      )}
      
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/shop" component={Shop} />
            <Route path="/new" component={() => <Shop />} />
            <Route path="/sale" component={() => <Shop />} />
            <Route path="/product/:id" component={ProductDetail} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/shop" component={Shop} />
            <Route path="/new" component={() => <Shop />} />
            <Route path="/sale" component={() => <Shop />} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-confirmation/:id" component={OrderConfirmation} />
            <Route path="/account/:rest*" component={Account} />
            <Route path="/wishlist" component={() => <Account />} />
            <Route path="/admin/:rest*" component={Admin} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>

      {!window.location.pathname.startsWith('/admin') && <Footer />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
