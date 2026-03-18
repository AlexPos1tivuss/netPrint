import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Redirect } from "wouter";
import { Camera, Package, Calendar, Users, Shield, Clock, Award, MapPin } from "lucide-react";
import sprinterLogo from "@assets/sprinter-logo.svg";
import photoalbumImage from "@assets/generated_images/Premium_hardcover_photo_album_6ecc0eee.png";
import photosImage from "@assets/generated_images/Stack_glossy_photo_prints_3ba30edf.png";
import calendarImage from "@assets/generated_images/Modern_wall_calendar_2025_6ee0d16e.png";
import { FAQChatbot } from "@/components/faq-chatbot";
import { useAuth } from "@/hooks/use-auth";

const services = [
  {
    icon: Package,
    title: 'Фотоальбомы',
    description: 'Качественные фотоальбомы с твердой или мягкой обложкой на любой вкус',
    image: photoalbumImage,
  },
  {
    icon: Camera,
    title: 'Фотографии',
    description: 'Печать фотографий различных форматов на глянцевой или матовой бумаге',
    image: photosImage,
  },
  {
    icon: Calendar,
    title: 'Календари',
    description: 'Настенные и настольные календари с вашими любимыми фотографиями',
    image: calendarImage,
  },
];

const features = [
  {
    icon: Award,
    title: 'Высокое качество',
    description: 'Профессиональное оборудование и материалы премиум-класса',
  },
  {
    icon: Clock,
    title: 'Быстрое выполнение',
    description: 'Печать и доставка в кратчайшие сроки',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: '100% гарантия на все наши продукты и услуги',
  },
  {
    icon: Users,
    title: 'Профессиональные фотографы',
    description: 'Услуги опытных фотографов для вашей фотосессии',
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect to="/catalog" />;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <img src={sprinterLogo} alt="S-Printer" className="h-8" />
            <nav className="hidden md:flex gap-6">
              <button 
                onClick={() => scrollToSection('services')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-services"
              >
                Услуги
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-features"
              >
                Преимущества
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-faq"
              >
                FAQ
              </button>
            </nav>
          </div>
          
          <Link href="/auth">
            <Button variant="default" data-testid="button-login">
              Войти
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Профессиональная фотопечать в Беларуси
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Печать фотографий, фотоальбомов и календарей — быстро и качественно
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Высокое качество
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Быстрая доставка
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Тысячи клиентов
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8" data-testid="button-get-started">
                  Начать заказ
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => scrollToSection('services')}
                data-testid="button-learn-more"
              >
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши услуги</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Широкий выбор продукции для сохранения ваших воспоминаний
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card 
                key={service.title}
                className="hover-elevate overflow-hidden"
                data-testid={`card-service-${index}`}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы гордимся качеством наших услуг и доверием клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="text-center"
                data-testid={`card-feature-${index}`}
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Часто задаваемые вопросы</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Задайте вопрос нашему боту-помощнику
            </p>
          </div>
          
          <FAQChatbot />
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <img src={sprinterLogo} alt="S-Printer" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground">
                Профессиональная фотопечать в Беларуси
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Контакты</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Беларусь</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Навигация</h3>
              <div className="space-y-2">
                <Link href="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Войти
                </Link>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Услуги
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Преимущества
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 S-Printer. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
