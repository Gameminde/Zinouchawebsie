import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_banner_fashion_model_3d202f18.png";
import makeupImage from "@assets/generated_images/Luxury_makeup_collection_flatlay_2460f55b.png";
import perfumeImage from "@assets/generated_images/Elegant_perfume_product_photo_1ee2b12c.png";
import clothingImage from "@assets/generated_images/Fashion_clothing_flatlay_photo_7e3706c5.png";

export default function Landing() {
  const collections = [
    {
      title: "Vêtements",
      image: clothingImage,
      description: "Découvrez notre collection exclusive",
      link: "/shop?category=vetements",
    },
    {
      title: "Maquillage",
      image: makeupImage,
      description: "Les dernières tendances beauté",
      link: "/shop?category=maquillage",
    },
    {
      title: "Parfums",
      image: perfumeImage,
      description: "Fragrances de luxe",
      link: "/shop?category=parfums",
    },
  ];

  const features = [
    {
      icon: Truck,
      title: "Livraison Gratuite",
      description: "Dès 5000 DA d'achat",
    },
    {
      icon: RefreshCw,
      title: "Retours Faciles",
      description: "Sous 15 jours",
    },
    {
      icon: Shield,
      title: "Paiement à la Livraison",
      description: "100% sécurisé",
    },
    {
      icon: Star,
      title: "Qualité Premium",
      description: "Produits sélectionnés",
    },
  ];

  const testimonials = [
    {
      name: "Marie L.",
      rating: 5,
      comment: "Une expérience d'achat exceptionnelle ! Les produits sont de très haute qualité.",
    },
    {
      name: "Sophie D.",
      rating: 5,
      comment: "Service client impeccable et livraison rapide. Je recommande vivement !",
    },
    {
      name: "Emma B.",
      rating: 5,
      comment: "Les parfums sont divins et le packaging est magnifique. Parfait pour offrir !",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10" />
        <img
          src={heroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto animate-in fade-in anim-duration-1000">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Élégance & Raffinement
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Découvrez notre collection exclusive de vêtements, maquillage et parfums pour femmes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-white text-lg px-8 py-6 rounded-full hover-elevate active-elevate-2"
              asChild
              data-testid="button-discover-collection"
            >
              <a href="/api/login">
                Découvrir la Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full"
              asChild
              data-testid="button-shop-now"
            >
              <Link href="/shop">Boutique</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Nos Collections
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explorez nos collections soigneusement sélectionnées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((collection, index) => (
              <Link key={collection.title} href={collection.link}>
                <Card
                  className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover-elevate active-elevate-2 animate-in fade-in-up anim-duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`card-collection-${collection.title.toLowerCase()}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-2">{collection.title}</h3>
                      <p className="text-sm text-white/90">{collection.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-in fade-in-up anim-duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ce que disent nos clientes
            </h2>
            <p className="text-muted-foreground text-lg">Des milliers de clientes satisfaites</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="animate-in fade-in-up anim-duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`testimonial-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">{testimonial.comment}</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-primary/10 to-gold/10">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Prête à découvrir l'élégance ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et recevez 10% de réduction sur votre première commande
          </p>
          <Button
            size="lg"
            className="bg-gold hover:bg-gold-dark text-white text-lg px-8 py-6 rounded-full hover-elevate active-elevate-2"
            asChild
            data-testid="button-join-now"
          >
            <a href="/api/login">
              Rejoignez-nous
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
