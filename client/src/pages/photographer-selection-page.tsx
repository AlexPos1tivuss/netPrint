import { useState } from "react";
import { useLocation, Link, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, User, Star, Check } from "lucide-react";
import { Photographer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import sprinterLogo from "@assets/sprinter-logo.svg";

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function PhotographerSelectionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const productType = params.get('product') || '';
  const productPrice = parseInt(params.get('price') || '0');

  const [selectedPhotographer, setSelectedPhotographer] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({ lat: 53.9045, lng: 27.5615 });

  const { data: photographers, isLoading } = useQuery<Photographer[]>({
    queryKey: ['/api/photographers'],
  });

  const selectedPhotographerData = photographers?.find(p => p.id === selectedPhotographer);
  const totalPrice = productPrice + (selectedPhotographerData?.pricePerHour || 0);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const storedConfig = sessionStorage.getItem('productConfig');
      let productConfig: Record<string, unknown> = {};
      try {
        productConfig = storedConfig ? (JSON.parse(storedConfig).config ?? {}) : {};
      } catch {
        productConfig = {};
      }
      
      const res = await apiRequest("POST", "/api/orders", {
        productType,
        totalPrice,
        photoSource: 'photographer',
        productConfig,
        photographerId: selectedPhotographer,
        shootingDate: selectedDate?.toISOString(),
        shootingTime: selectedTime,
        shootingLocation: location,
        shootingCoordinates: coordinates,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      sessionStorage.removeItem('productConfig');
      toast({
        title: "Заказ создан!",
        description: "Ваш заказ с услугой фотографа успешно оформлен",
      });
      navigate('/profile');
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedPhotographer || !selectedDate || !selectedTime || !location) {
      toast({
        title: "Заполните все поля",
        description: "Выберите фотографа, дату, время и место съемки",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  const popularLocations = [
    { name: "На усмотрение фотографа", coords: { lat: 53.9045, lng: 27.5615 } },
    { name: "Центральный сквер", coords: { lat: 53.9068, lng: 27.5678 } },
    { name: "Парк Горького", coords: { lat: 53.8890, lng: 27.5420 } },
    { name: "Площадь Победы", coords: { lat: 53.9054, lng: 27.5437 } },
    { name: "Проспект Независимости", coords: { lat: 53.9010, lng: 27.5590 } },
    { name: "Троицкое предместье", coords: { lat: 53.9168, lng: 27.5482 } },
    { name: "Комсомольское озеро", coords: { lat: 53.9130, lng: 27.5700 } },
    { name: "Ботанический сад", coords: { lat: 53.9396, lng: 27.6054 } },
  ];

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const selectedLocation = popularLocations.find(loc => loc.name === value);
    if (selectedLocation) {
      setCoordinates(selectedLocation.coords);
    }
  };

  const storedConfigRaw = sessionStorage.getItem('productConfig');
  let hasValidConfig = false;
  try {
    if (storedConfigRaw) {
      const parsed = JSON.parse(storedConfigRaw);
      hasValidConfig = !!parsed && typeof parsed === 'object';
    }
  } catch {
    hasValidConfig = false;
  }

  if (!productType || !hasValidConfig) {
    return <Redirect to="/catalog" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/catalog">
            <img src={sprinterLogo} alt="S-Printer" className="h-8 cursor-pointer" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(productType ? `/product/${productType}` : '/catalog')} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к настройкам
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Выбор фотографа</h1>
              <p className="text-muted-foreground">
                Выберите фотографа, дату, время и место съемки
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Выберите фотографа</CardTitle>
                <CardDescription>
                  Наши профессиональные фотографы с опытом работы
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <RadioGroup value={selectedPhotographer} onValueChange={setSelectedPhotographer}>
                    <div className="space-y-3">
                      {photographers?.map((photographer) => (
                        <div 
                          key={photographer.id}
                          className={`flex items-start gap-4 p-4 rounded-md border transition-colors cursor-pointer hover-elevate ${
                            selectedPhotographer === photographer.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border'
                          }`}
                          onClick={() => setSelectedPhotographer(photographer.id)}
                          data-testid={`photographer-${photographer.id}`}
                        >
                          <RadioGroupItem value={photographer.id} id={photographer.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <img 
                                src={photographer.photo} 
                                alt={photographer.name}
                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <Label htmlFor={photographer.id} className="text-base font-semibold cursor-pointer">
                                  {photographer.name}
                                </Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {photographer.specialization}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{photographer.rating}/5</span>
                                  </div>
                                  <Badge variant="secondary">
                                    {photographer.pricePerHour.toLocaleString('ru-RU')} р./час
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Дата и время съемки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Выберите дату</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left"
                        data-testid="button-date-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Выберите время</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        data-testid={`button-time-${time}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Место съемки</CardTitle>
                <CardDescription>
                  Выберите место фотосессии
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full h-64 rounded-md overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${coordinates.lat},${coordinates.lng}&zoom=14`}
                    allowFullScreen
                    title="Google Maps"
                    data-testid="google-maps-iframe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Популярные места</Label>
                  <Select value={location} onValueChange={handleLocationChange}>
                    <SelectTrigger id="location" data-testid="select-location">
                      <SelectValue placeholder="Выберите место съемки" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularLocations.map((loc) => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Выберите "На усмотрение фотографа", если не знаете конкретное место
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Продукт</span>
                    <span className="font-medium">{productPrice} р.</span>
                  </div>
                  {selectedPhotographerData && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фотограф (1ч)</span>
                      <span className="font-medium">{selectedPhotographerData.pricePerHour.toLocaleString('ru-RU')} р.</span>
                    </div>
                  )}
                </div>
                
                {selectedPhotographerData && selectedDate && selectedTime && location && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Детали заказа</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span>{selectedPhotographerData.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                          <span>{format(selectedDate, "d MMMM, HH:mm", { locale: ru }).replace("HH:mm", selectedTime)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground" />
                          <span className="text-xs line-clamp-2">{location}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Итого</span>
                    <span className="text-primary" data-testid="price-total">
                      {totalPrice.toLocaleString('ru-RU')} р.
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedPhotographer || !selectedDate || !selectedTime || !location || createOrderMutation.isPending}
                    data-testid="button-create-order"
                  >
                    {createOrderMutation.isPending ? "Создание заказа..." : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Оформить заказ
                      </>
                    )}
                  </Button>
                  {(!selectedPhotographer || !selectedDate || !selectedTime || !location) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Заполните все поля для оформления заказа
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
