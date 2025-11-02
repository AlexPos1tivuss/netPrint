import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Camera, User, ShoppingCart, LogOut, Shield } from "lucide-react";
import logoSvg from "@assets/netprint-logo.svg";
import photoalbumImage from "@assets/generated_images/Premium_hardcover_photo_album_6ecc0eee.png";
import photosImage from "@assets/generated_images/Stack_glossy_photo_prints_3ba30edf.png";
import calendarImage from "@assets/generated_images/Modern_wall_calendar_2025_6ee0d16e.png";

const products = [
  {
    type: 'photoalbum',
    displayName: 'Фотоальбом',
    description: 'Качественные фотоальбомы с твердой или мягкой обложкой',
    image: photoalbumImage,
    priceFrom: 1500,
  },
  {
    type: 'photos',
    displayName: 'Фотографии',
    description: 'Печать фотографий различных форматов на глянцевой или матовой бумаге',
    image: photosImage,
    priceFrom: 10,
  },
  {
    type: 'calendar',
    displayName: 'Календарь',
    description: 'Настенные и настольные календари с вашими фотографиями',
    image: calendarImage,
    priceFrom: 800,
  },
];

export default function CatalogPage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/catalog">
            <img src={logoSvg} alt="Netprint" className="h-8 cursor-pointer" />
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.username}
            </span>
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" data-testid="link-admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Админ-панель
                </Button>
              </Link>
            )}
            <Link href="/profile">
              <Button variant="ghost" size="sm" data-testid="link-profile">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Профиль</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Выход</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Профессиональная печать фотографий
            </h1>
            <p className="text-xl text-muted-foreground">
              Качественная печать фотоальбомов, фотографий и календарей. 
              Быстрая доставка по всей России. Услуги профессиональных фотографов.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                ✓ Высокое качество
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                ✓ Быстрая доставка
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                ✓ Тысячи клиентов
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Выберите тип продукта</h2>
            <p className="text-muted-foreground">
              Создайте фотоальбом, напечатайте фотографии или закажите календарь
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product) => (
              <Card 
                key={product.type} 
                className="hover-elevate active-elevate-2 transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product.type}`)}
                data-testid={`card-product-${product.type}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.displayName}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{product.displayName}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center gap-2">
                  <div>
                    <span className="text-sm text-muted-foreground">от </span>
                    <span className="text-2xl font-bold text-primary">{product.priceFrom} ₽</span>
                  </div>
                  <Button data-testid={`button-configure-${product.type}`}>
                    Настроить
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photographer CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Camera className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  Нужен профессиональный фотограф?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Закажите фотосессию у наших опытных фотографов. 
                  Мы поможем создать незабываемые снимки для ваших альбомов и календарей.
                </p>
                <div>
                  <Button 
                    size="lg"
                    onClick={() => {
                      // Store minimal config and navigate to photographer page
                      sessionStorage.setItem('productConfig', JSON.stringify({
                        config: {},
                        product: 'photoalbum',
                        price: 1500
                      }));
                      navigate('/photographer?product=photoalbum&price=1500');
                    }}
                    data-testid="button-hire-photographer"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Заказать фотографа
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-12 flex items-center justify-center">
                <Camera className="h-48 w-48 text-primary/20" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
