import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Camera, User, ShoppingCart, LogOut, Shield } from "lucide-react";
import logoImage from "@assets/generated_images/ФотоПринт_logo_modern_blue_239702b0.png";
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

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="ФотоПринт" className="h-10" />
          </div>
          
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
                className="hover-elevate active-elevate-2 transition-all cursor-pointer"
                onClick={() => navigate(`/product/${product.type}`)}
                data-testid={`card-product-${product.type}`}
              >
                <CardHeader className="p-0">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{product.displayName}</CardTitle>
                  <CardDescription className="mb-4">
                    {product.description}
                  </CardDescription>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">От</span>
                    <span className="text-2xl font-bold">{product.priceFrom} ₽</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full" data-testid={`button-select-${product.type}`}>
                    Выбрать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Наши преимущества</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Профессиональные фотографы</h3>
                  <p className="text-sm text-muted-foreground">
                    Закажите профессиональную фотосессию с выбором фотографа, места и времени
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Удобный заказ</h3>
                  <p className="text-sm text-muted-foreground">
                    Загрузите свои фотографии или закажите профессиональную съемку онлайн
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Гарантия качества</h3>
                  <p className="text-sm text-muted-foreground">
                    Используем только профессиональное оборудование и качественные материалы
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🚚</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Быстрая доставка</h3>
                  <p className="text-sm text-muted-foreground">
                    Доставляем готовые заказы по всей России в кратчайшие сроки
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 ФотоПринт. Все права защищены.</p>
            <p className="mt-2">Профессиональная печать фотографий по всей России</p>
          </div>
        </div>
      </footer>
    </div>
  );
}