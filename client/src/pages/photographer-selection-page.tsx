import { useState } from "react";
import { useLocation, Link } from "wouter";
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
import logoSvg from "@assets/netprint-logo.svg";

// Time slots
const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function PhotographerSelectionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get params from URL
  const params = new URLSearchParams(window.location.search);
  const productType = params.get('product') || '';
  const productPrice = parseInt(params.get('price') || '0');

  const [selectedPhotographer, setSelectedPhotographer] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({ lat: 55.7558, lng: 37.6173 }); // Default to Moscow center

  const { data: photographers, isLoading } = useQuery<Photographer[]>({
    queryKey: ['/api/photographers'],
  });

  const selectedPhotographerData = photographers?.find(p => p.id === selectedPhotographer);
  const totalPrice = productPrice + (selectedPhotographerData?.pricePerHour || 0);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // Get product config from sessionStorage
      const storedConfig = sessionStorage.getItem('productConfig');
      const productConfig = storedConfig ? JSON.parse(storedConfig).config : {};
      
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

  // Predefined popular Moscow locations (8 locations + photographer's discretion)
  const popularLocations = [
    { name: "На усмотрение фотографа", coords: { lat: 55.7558, lng: 37.6173 } },
    { name: "Красная площадь", coords: { lat: 55.7539, lng: 37.6208 } },
    { name: "Парк Горького", coords: { lat: 55.7304, lng: 37.6013 } },
    { name: "ВДНХ", coords: { lat: 55.8304, lng: 37.6286 } },
    { name: "Парк Зарядье", coords: { lat: 55.7513, lng: 37.6285 } },
    { name: "Воробьёвы горы", coords: { lat: 55.7105, lng: 37.5424 } },
    { name: "Патриаршие пруды", coords: { lat: 55.7649, lng: 37.5949 } },
    { name: "Коломенское", coords: { lat: 55.6672, lng: 37.6719 } },
    { name: "Московский Кремль", coords: { lat: 55.7520, lng: 37.6175 } },
  ];

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const selectedLocation = popularLocations.find(loc => loc.name === value);
    if (selectedLocation) {
      setCoordinates(selectedLocation.coords);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={logoSvg} alt="Netprint" className="h-8 cursor-pointer" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/product/${productType}`)} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Выбор фотографа</h1>
              <p className="text-muted-foreground">
                Выберите фотографа, дату, время и место съемки
              </p>
            </div>

            {/* Photographer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Выберите фотографа</CardTitle>
                <CardDescription>
                  Наши профессиональные фотографы с опытом работы
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Загрузка фотографов...
                  </div>
                ) : (
                  <RadioGroup value={selectedPhotographer} onValueChange={setSelectedPhotographer}>
                    <div className="space-y-4">
                      {photographers?.map((photographer) => (
                        <div 
                          key={photographer.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                            selectedPhotographer === photographer.id ? 'border-primary bg-primary/5' : 'border-border'
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
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <Label htmlFor={photographer.id} className="text-lg font-semibold cursor-pointer">
                                  {photographer.name}
                                </Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {photographer.specialization}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{photographer.rating}/5</span>
                                  </div>
                                  <Badge variant="secondary">
                                    {photographer.pricePerHour.toLocaleString('ru-RU')} ₽/час
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

            {/* Date and Time Selection */}
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
                  <div className="grid grid-cols-4 gap-2">
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

            {/* Location Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Место съемки</CardTitle>
                <CardDescription>
                  Выберите место фотосессии на карте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google Maps Embed - Always visible */}
                <div className="w-full h-80 rounded-lg overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${coordinates.lat},${coordinates.lng}&zoom=14`}
                    allowFullScreen
                    title="Google Maps"
                    data-testid="google-maps-iframe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Выберите популярное место</Label>
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

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Продукт</span>
                    <span>{productPrice} ₽</span>
                  </div>
                  {selectedPhotographerData && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фотограф</span>
                      <span>{selectedPhotographerData.pricePerHour} ₽</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Итого</span>
                    <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  {selectedPhotographerData && selectedDate && selectedTime && location && (
                    <div className="mb-4 p-3 bg-muted rounded-lg text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{selectedPhotographerData.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{format(selectedDate, "PPP", { locale: ru })} в {selectedTime}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{location}</span>
                      </div>
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedPhotographer || !selectedDate || !selectedTime || !location || createOrderMutation.isPending}
                    data-testid="button-create-order"
                  >
                    {createOrderMutation.isPending ? (
                      "Создание заказа..."
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Оформить заказ
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}