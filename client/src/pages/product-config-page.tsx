import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Camera, MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { PhotoalbumConfig, PhotosConfig, CalendarConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import logoSvg from "@assets/netprint-logo.svg";
import photoalbumImage from "@assets/generated_images/Premium_hardcover_photo_album_6ecc0eee.png";
import photosImage from "@assets/generated_images/Stack_glossy_photo_prints_3ba30edf.png";
import calendarImage from "@assets/generated_images/Modern_wall_calendar_2025_6ee0d16e.png";

type ProductConfig = PhotoalbumConfig | PhotosConfig | CalendarConfig;

// Price calculation logic
const calculatePrice = (productType: string, config: ProductConfig): number => {
  if (productType === 'photoalbum') {
    const c = config as PhotoalbumConfig;
    let price = 500; // base
    if (c.size === 'medium') price += 500;
    if (c.size === 'large') price += 1000;
    if (c.coverType === 'hard') price += 300;
    if (c.coverType === 'premium') price += 800;
    price += c.pages * 50;
    if (c.paperType === 'glossy') price += 200;
    return price;
  } else if (productType === 'photos' || productType === 'prints') {
    const c = config as PhotosConfig;
    let pricePerPhoto = 10;
    if (c.size === '15x20') pricePerPhoto = 15;
    if (c.size === '20x30') pricePerPhoto = 25;
    if (c.paperType === 'glossy') pricePerPhoto += 3;
    if (c.border) pricePerPhoto += 2;
    return pricePerPhoto * c.quantity;
  } else {
    const c = config as CalendarConfig;
    let price = 600;
    if (c.type === 'wall') price += 200;
    if (c.size === 'A3') price += 300;
    if (c.months === 12) price += 200;
    if (c.binding === 'spiral') price += 150;
    return price;
  }
};

export default function ProductConfigPage() {
  const [, params] = useRoute("/product/:type");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const productType = params?.type || '';
  
  const [photoSource, setPhotoSource] = useState<'upload' | 'photographer'>('upload');
  
  // Photoalbum config
  const [photoalbumConfig, setPhotoalbumConfig] = useState<PhotoalbumConfig>({
    size: 'medium',
    coverType: 'hard',
    pages: 20,
    paperType: 'glossy',
  });

  // Photos config
  const [photosConfig, setPhotosConfig] = useState<PhotosConfig>({
    size: '10x15',
    quantity: 10,
    paperType: 'glossy',
    border: false,
  });

  // Calendar config
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>({
    type: 'wall',
    size: 'A4',
    months: 12,
    binding: 'spiral',
  });

  const getCurrentConfig = (): ProductConfig => {
    if (productType === 'photoalbum') return photoalbumConfig;
    if (productType === 'photos' || productType === 'prints') return photosConfig;
    return calendarConfig;
  };

  const price = calculatePrice(productType, getCurrentConfig());

  const handleAddToCart = () => {
    // Store the product config in sessionStorage
    const config = getCurrentConfig();
    sessionStorage.setItem('productConfig', JSON.stringify({
      productType,
      config,
      price,
    }));
    
    // Navigate to appropriate page based on photo source
    if (photoSource === 'upload') {
      navigate(`/upload?product=${productType}&price=${price}`);
    } else {
      navigate(`/photographer?product=${productType}&price=${price}`);
    }
  };

  if (!['photoalbum', 'photos', 'prints', 'calendar'].includes(productType)) {
    return <div>Продукт не найден</div>;
  }

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
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к выбору продукта
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {productType === 'photoalbum' && 'Настройка фотоальбома'}
                {(productType === 'photos' || productType === 'prints') && 'Настройка печати фотографий'}
                {productType === 'calendar' && 'Настройка календаря'}
              </h1>
              <p className="text-muted-foreground">
                Выберите параметры вашего заказа
              </p>
            </div>

            {/* Product Image Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-lg"
            >
              <img
                src={
                  productType === 'photoalbum' ? photoalbumImage :
                  (productType === 'photos' || productType === 'prints') ? photosImage :
                  calendarImage
                }
                alt={
                  productType === 'photoalbum' ? 'Фотоальбом' :
                  (productType === 'photos' || productType === 'prints') ? 'Фотографии' :
                  'Календарь'
                }
                className="w-full h-64 object-cover rounded-lg"
                data-testid="product-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold">
                  {productType === 'photoalbum' && 'Фотоальбом'}
                  {(productType === 'photos' || productType === 'prints') && 'Печать фотографий'}
                  {productType === 'calendar' && 'Календарь'}
                </h3>
                <p className="text-sm text-white/90">
                  {productType === 'photoalbum' && 'Премиум качество для ваших воспоминаний'}
                  {(productType === 'photos' || productType === 'prints') && 'Профессиональная печать на качественной бумаге'}
                  {productType === 'calendar' && 'Настенный календарь с вашими фотографиями'}
                </p>
              </div>
            </motion.div>

            {/* Photoalbum Configuration */}
            {productType === 'photoalbum' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card>
                <CardHeader>
                  <CardTitle>Параметры фотоальбома</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Размер</Label>
                    <RadioGroup value={photoalbumConfig.size} onValueChange={(v: any) => setPhotoalbumConfig({...photoalbumConfig, size: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="size-small" data-testid="radio-size-small" />
                        <Label htmlFor="size-small" className="font-normal cursor-pointer">Маленький (15x15 см) - 500 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="size-medium" data-testid="radio-size-medium" />
                        <Label htmlFor="size-medium" className="font-normal cursor-pointer">Средний (20x20 см) - 1 000 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="size-large" data-testid="radio-size-large" />
                        <Label htmlFor="size-large" className="font-normal cursor-pointer">Большой (30x30 см) - 1 500 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Тип обложки</Label>
                    <RadioGroup value={photoalbumConfig.coverType} onValueChange={(v: any) => setPhotoalbumConfig({...photoalbumConfig, coverType: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="soft" id="cover-soft" data-testid="radio-cover-soft" />
                        <Label htmlFor="cover-soft" className="font-normal cursor-pointer">Мягкая - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hard" id="cover-hard" data-testid="radio-cover-hard" />
                        <Label htmlFor="cover-hard" className="font-normal cursor-pointer">Твердая - 300 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="cover-premium" data-testid="radio-cover-premium" />
                        <Label htmlFor="cover-premium" className="font-normal cursor-pointer">Премиум (кожа) - 800 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pages">Количество страниц (50 ₽ за страницу)</Label>
                    <Select value={photoalbumConfig.pages.toString()} onValueChange={(v) => setPhotoalbumConfig({...photoalbumConfig, pages: parseInt(v)})}>
                      <SelectTrigger id="pages" data-testid="select-pages">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 страниц</SelectItem>
                        <SelectItem value="30">30 страниц</SelectItem>
                        <SelectItem value="40">40 страниц</SelectItem>
                        <SelectItem value="50">50 страниц</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Тип бумаги</Label>
                    <RadioGroup value={photoalbumConfig.paperType} onValueChange={(v: any) => setPhotoalbumConfig({...photoalbumConfig, paperType: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="matte" id="paper-matte" data-testid="radio-paper-matte" />
                        <Label htmlFor="paper-matte" className="font-normal cursor-pointer">Матовая - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glossy" id="paper-glossy" data-testid="radio-paper-glossy" />
                        <Label htmlFor="paper-glossy" className="font-normal cursor-pointer">Глянцевая - 200 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Photos Configuration */}
            {(productType === 'photos' || productType === 'prints') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card>
                <CardHeader>
                  <CardTitle>Параметры печати фотографий</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Размер фотографии</Label>
                    <RadioGroup value={photosConfig.size} onValueChange={(v: any) => setPhotosConfig({...photosConfig, size: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10x15" id="photo-10x15" data-testid="radio-size-10x15" />
                        <Label htmlFor="photo-10x15" className="font-normal cursor-pointer">10x15 см - 10 ₽/шт</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="15x20" id="photo-15x20" data-testid="radio-size-15x20" />
                        <Label htmlFor="photo-15x20" className="font-normal cursor-pointer">15x20 см - 15 ₽/шт</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="20x30" id="photo-20x30" data-testid="radio-size-20x30" />
                        <Label htmlFor="photo-20x30" className="font-normal cursor-pointer">20x30 см - 25 ₽/шт</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="quantity">Количество фотографий</Label>
                    <Select value={photosConfig.quantity.toString()} onValueChange={(v) => setPhotosConfig({...photosConfig, quantity: parseInt(v)})}>
                      <SelectTrigger id="quantity" data-testid="select-quantity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 фотографий</SelectItem>
                        <SelectItem value="20">20 фотографий</SelectItem>
                        <SelectItem value="30">30 фотографий</SelectItem>
                        <SelectItem value="50">50 фотографий</SelectItem>
                        <SelectItem value="100">100 фотографий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Тип бумаги</Label>
                    <RadioGroup value={photosConfig.paperType} onValueChange={(v: any) => setPhotosConfig({...photosConfig, paperType: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="matte" id="photo-paper-matte" data-testid="radio-paper-matte" />
                        <Label htmlFor="photo-paper-matte" className="font-normal cursor-pointer">Матовая - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glossy" id="photo-paper-glossy" data-testid="radio-paper-glossy" />
                        <Label htmlFor="photo-paper-glossy" className="font-normal cursor-pointer">Глянцевая - +3 ₽/шт</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Белая рамка</Label>
                    <RadioGroup value={photosConfig.border ? 'yes' : 'no'} onValueChange={(v) => setPhotosConfig({...photosConfig, border: v === 'yes'})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="border-no" data-testid="radio-border-no" />
                        <Label htmlFor="border-no" className="font-normal cursor-pointer">Без рамки - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="border-yes" data-testid="radio-border-yes" />
                        <Label htmlFor="border-yes" className="font-normal cursor-pointer">С белой рамкой - +2 ₽/шт</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Calendar Configuration */}
            {productType === 'calendar' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card>
                <CardHeader>
                  <CardTitle>Параметры календаря</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Тип календаря</Label>
                    <RadioGroup value={calendarConfig.type} onValueChange={(v: any) => setCalendarConfig({...calendarConfig, type: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desk" id="type-desk" data-testid="radio-type-desk" />
                        <Label htmlFor="type-desk" className="font-normal cursor-pointer">Настольный - 600 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wall" id="type-wall" data-testid="radio-type-wall" />
                        <Label htmlFor="type-wall" className="font-normal cursor-pointer">Настенный - 800 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Размер</Label>
                    <RadioGroup value={calendarConfig.size} onValueChange={(v: any) => setCalendarConfig({...calendarConfig, size: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A4" id="size-a4" data-testid="radio-size-a4" />
                        <Label htmlFor="size-a4" className="font-normal cursor-pointer">A4 - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A3" id="size-a3" data-testid="radio-size-a3" />
                        <Label htmlFor="size-a3" className="font-normal cursor-pointer">A3 - 300 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Количество месяцев</Label>
                    <RadioGroup value={calendarConfig.months.toString()} onValueChange={(v) => setCalendarConfig({...calendarConfig, months: parseInt(v) as 6 | 12})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="months-6" data-testid="radio-months-6" />
                        <Label htmlFor="months-6" className="font-normal cursor-pointer">6 месяцев - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="months-12" data-testid="radio-months-12" />
                        <Label htmlFor="months-12" className="font-normal cursor-pointer">12 месяцев - 200 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Тип переплета</Label>
                    <RadioGroup value={calendarConfig.binding} onValueChange={(v: any) => setCalendarConfig({...calendarConfig, binding: v})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glued" id="binding-glued" data-testid="radio-binding-glued" />
                        <Label htmlFor="binding-glued" className="font-normal cursor-pointer">Клееный - 0 ₽</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spiral" id="binding-spiral" data-testid="radio-binding-spiral" />
                        <Label htmlFor="binding-spiral" className="font-normal cursor-pointer">Спираль - 150 ₽</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Photo Source Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
              <CardHeader>
                <CardTitle>Источник фотографий</CardTitle>
                <CardDescription>Выберите как вы хотите предоставить фотографии</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={photoSource} onValueChange={(v: any) => setPhotoSource(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" data-testid="tab-upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить фото
                    </TabsTrigger>
                    <TabsTrigger value="photographer" data-testid="tab-photographer">
                      <Camera className="mr-2 h-4 w-4" />
                      Услуга фотографа
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Загрузите свои готовые фотографии (до 20 штук) для печати
                    </p>
                  </TabsContent>
                  <TabsContent value="photographer" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Закажите профессиональную фотосессию с выбором фотографа, места и времени
                    </p>
                    <Badge variant="secondary" className="mt-2">Доп. стоимость от 2000 ₽/час</Badge>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          {/* Price Summary (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Продукт</span>
                    <span>{price} ₽</span>
                  </div>
                  {photoSource === 'photographer' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Фотограф</span>
                      <span>от 2000 ₽</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span>{price} ₽{photoSource === 'photographer' ? '+' : ''}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleAddToCart}
                  data-testid="button-continue"
                >
                  {photoSource === 'upload' ? 'Загрузить фото' : 'Выбрать фотографа'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}