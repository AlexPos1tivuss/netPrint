import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Camera, Loader2 } from "lucide-react";
import type { PhotoalbumConfig, PhotosConfig, CalendarConfig, ProductType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import sprinterLogo from "@assets/sprinter-logo.svg";
import photoalbumImage from "@assets/generated_images/Premium_hardcover_photo_album_6ecc0eee.png";
import photosImage from "@assets/generated_images/Stack_glossy_photo_prints_3ba30edf.png";
import calendarImage from "@assets/generated_images/Modern_wall_calendar_2025_6ee0d16e.png";

type ProductConfig = PhotoalbumConfig | PhotosConfig | CalendarConfig;

const VALID_TYPES = ['photoalbum', 'photos', 'prints', 'calendar'];

const calculatePrice = (productType: string, config: ProductConfig): number => {
  if (productType === 'photoalbum') {
    const c = config as PhotoalbumConfig;
    let price = 500;
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

const isPhotosType = (type: string) => type === 'photos' || type === 'prints';

export default function ProductConfigPage() {
  const [, params] = useRoute("/product/:type");
  const [, navigate] = useLocation();
  const productType = params?.type || '';

  const { data: apiProducts, isLoading: productsLoading } = useQuery<ProductType[]>({
    queryKey: ['/api/products'],
  });

  const [photoSource, setPhotoSource] = useState<'upload' | 'photographer'>('upload');
  
  const [photoalbumConfig, setPhotoalbumConfig] = useState<PhotoalbumConfig>({
    size: 'medium',
    coverType: 'hard',
    pages: 20,
    paperType: 'glossy',
  });

  const [photosConfig, setPhotosConfig] = useState<PhotosConfig>({
    size: '10x15',
    quantity: 10,
    paperType: 'glossy',
    border: false,
  });

  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>({
    type: 'wall',
    size: 'A4',
    months: 12,
    binding: 'spiral',
  });

  const getCurrentConfig = (): ProductConfig => {
    if (productType === 'photoalbum') return photoalbumConfig;
    if (isPhotosType(productType)) return photosConfig;
    return calendarConfig;
  };

  const price = calculatePrice(productType, getCurrentConfig());

  const handleContinue = () => {
    const config = getCurrentConfig();
    sessionStorage.setItem('productConfig', JSON.stringify({
      productType,
      config,
      price,
    }));
    
    if (photoSource === 'upload') {
      navigate(`/upload?product=${productType}&price=${price}`);
    } else {
      navigate(`/photographer?product=${productType}&price=${price}`);
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const validTypes = apiProducts
    ? apiProducts.map(p => p.name)
    : VALID_TYPES;

  if (!validTypes.includes(productType)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Продукт не найден</h1>
          <Link href="/catalog">
            <Button>Вернуться в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  const productTitle = productType === 'photoalbum' ? 'Фотоальбом' 
    : isPhotosType(productType) ? 'Печать фотографий' 
    : 'Календарь';

  const productSubtitle = productType === 'photoalbum' ? 'Премиум качество для ваших воспоминаний'
    : isPhotosType(productType) ? 'Профессиональная печать на качественной бумаге'
    : 'Настенный или настольный календарь с вашими фотографиями';

  const productImage = productType === 'photoalbum' ? photoalbumImage 
    : isPhotosType(productType) ? photosImage 
    : calendarImage;

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
        <Button variant="ghost" onClick={() => navigate('/catalog')} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к выбору продукта
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Настройка: {productTitle}
              </h1>
              <p className="text-muted-foreground">Выберите параметры вашего заказа</p>
            </div>

            <div className="relative overflow-hidden rounded-md">
              <img
                src={productImage}
                alt={productTitle}
                className="w-full h-56 object-cover rounded-md"
                data-testid="product-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-md" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{productTitle}</h3>
                <p className="text-sm text-white/80">{productSubtitle}</p>
              </div>
            </div>

            {productType === 'photoalbum' && (
              <Card>
                <CardHeader>
                  <CardTitle>Параметры фотоальбома</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-medium">Размер</Label>
                    <RadioGroup
                      value={photoalbumConfig.size}
                      onValueChange={(v) => setPhotoalbumConfig(prev => ({...prev, size: v as PhotoalbumConfig['size']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="size-small" data-testid="radio-size-small" />
                        <Label htmlFor="size-small" className="font-normal cursor-pointer">Маленький (15×15 см) — 500 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="size-medium" data-testid="radio-size-medium" />
                        <Label htmlFor="size-medium" className="font-normal cursor-pointer">Средний (20×20 см) — 1 000 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="size-large" data-testid="radio-size-large" />
                        <Label htmlFor="size-large" className="font-normal cursor-pointer">Большой (30×30 см) — 1 500 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Тип обложки</Label>
                    <RadioGroup
                      value={photoalbumConfig.coverType}
                      onValueChange={(v) => setPhotoalbumConfig(prev => ({...prev, coverType: v as PhotoalbumConfig['coverType']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="soft" id="cover-soft" data-testid="radio-cover-soft" />
                        <Label htmlFor="cover-soft" className="font-normal cursor-pointer">Мягкая — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hard" id="cover-hard" data-testid="radio-cover-hard" />
                        <Label htmlFor="cover-hard" className="font-normal cursor-pointer">Твердая — 300 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="cover-premium" data-testid="radio-cover-premium" />
                        <Label htmlFor="cover-premium" className="font-normal cursor-pointer">Премиум (кожа) — 800 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="pages" className="font-medium">Количество страниц (50 р./страница)</Label>
                    <Select
                      value={photoalbumConfig.pages.toString()}
                      onValueChange={(v) => setPhotoalbumConfig(prev => ({...prev, pages: parseInt(v)}))}
                    >
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

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Тип бумаги</Label>
                    <RadioGroup
                      value={photoalbumConfig.paperType}
                      onValueChange={(v) => setPhotoalbumConfig(prev => ({...prev, paperType: v as PhotoalbumConfig['paperType']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="matte" id="paper-matte" data-testid="radio-paper-matte" />
                        <Label htmlFor="paper-matte" className="font-normal cursor-pointer">Матовая — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glossy" id="paper-glossy" data-testid="radio-paper-glossy" />
                        <Label htmlFor="paper-glossy" className="font-normal cursor-pointer">Глянцевая — 200 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPhotosType(productType) && (
              <Card>
                <CardHeader>
                  <CardTitle>Параметры печати фотографий</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-medium">Размер фотографии</Label>
                    <RadioGroup
                      value={photosConfig.size}
                      onValueChange={(v) => setPhotosConfig(prev => ({...prev, size: v as PhotosConfig['size']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10x15" id="photo-10x15" data-testid="radio-size-10x15" />
                        <Label htmlFor="photo-10x15" className="font-normal cursor-pointer">10×15 см — 10 р./шт</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="15x20" id="photo-15x20" data-testid="radio-size-15x20" />
                        <Label htmlFor="photo-15x20" className="font-normal cursor-pointer">15×20 см — 15 р./шт</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="20x30" id="photo-20x30" data-testid="radio-size-20x30" />
                        <Label htmlFor="photo-20x30" className="font-normal cursor-pointer">20×30 см — 25 р./шт</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="quantity" className="font-medium">Количество фотографий</Label>
                    <Select
                      value={photosConfig.quantity.toString()}
                      onValueChange={(v) => setPhotosConfig(prev => ({...prev, quantity: parseInt(v)}))}
                    >
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

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Тип бумаги</Label>
                    <RadioGroup
                      value={photosConfig.paperType}
                      onValueChange={(v) => setPhotosConfig(prev => ({...prev, paperType: v as PhotosConfig['paperType']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="matte" id="photo-paper-matte" data-testid="radio-paper-matte" />
                        <Label htmlFor="photo-paper-matte" className="font-normal cursor-pointer">Матовая — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glossy" id="photo-paper-glossy" data-testid="radio-paper-glossy" />
                        <Label htmlFor="photo-paper-glossy" className="font-normal cursor-pointer">Глянцевая — +3 р./шт</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Белая рамка</Label>
                    <RadioGroup
                      value={photosConfig.border ? 'yes' : 'no'}
                      onValueChange={(v) => setPhotosConfig(prev => ({...prev, border: v === 'yes'}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="border-no" data-testid="radio-border-no" />
                        <Label htmlFor="border-no" className="font-normal cursor-pointer">Без рамки — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="border-yes" data-testid="radio-border-yes" />
                        <Label htmlFor="border-yes" className="font-normal cursor-pointer">С белой рамкой — +2 р./шт</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {productType === 'calendar' && (
              <Card>
                <CardHeader>
                  <CardTitle>Параметры календаря</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-medium">Тип календаря</Label>
                    <RadioGroup
                      value={calendarConfig.type}
                      onValueChange={(v) => setCalendarConfig(prev => ({...prev, type: v as CalendarConfig['type']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desk" id="type-desk" data-testid="radio-type-desk" />
                        <Label htmlFor="type-desk" className="font-normal cursor-pointer">Настольный — 600 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wall" id="type-wall" data-testid="radio-type-wall" />
                        <Label htmlFor="type-wall" className="font-normal cursor-pointer">Настенный — 800 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Размер</Label>
                    <RadioGroup
                      value={calendarConfig.size}
                      onValueChange={(v) => setCalendarConfig(prev => ({...prev, size: v as CalendarConfig['size']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A4" id="size-a4" data-testid="radio-size-a4" />
                        <Label htmlFor="size-a4" className="font-normal cursor-pointer">A4 — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A3" id="size-a3" data-testid="radio-size-a3" />
                        <Label htmlFor="size-a3" className="font-normal cursor-pointer">A3 — 300 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Количество месяцев</Label>
                    <RadioGroup
                      value={calendarConfig.months.toString()}
                      onValueChange={(v) => setCalendarConfig(prev => ({...prev, months: parseInt(v) as CalendarConfig['months']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="months-6" data-testid="radio-months-6" />
                        <Label htmlFor="months-6" className="font-normal cursor-pointer">6 месяцев — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="months-12" data-testid="radio-months-12" />
                        <Label htmlFor="months-12" className="font-normal cursor-pointer">12 месяцев — 200 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="font-medium">Тип переплета</Label>
                    <RadioGroup
                      value={calendarConfig.binding}
                      onValueChange={(v) => setCalendarConfig(prev => ({...prev, binding: v as CalendarConfig['binding']}))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="glued" id="binding-glued" data-testid="radio-binding-glued" />
                        <Label htmlFor="binding-glued" className="font-normal cursor-pointer">Клееный — 0 р.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spiral" id="binding-spiral" data-testid="radio-binding-spiral" />
                        <Label htmlFor="binding-spiral" className="font-normal cursor-pointer">Спираль — 150 р.</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Источник фотографий</CardTitle>
                <CardDescription>Выберите, как вы хотите предоставить фотографии</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={photoSource} onValueChange={(v) => setPhotoSource(v as 'upload' | 'photographer')}>
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
                    <Badge variant="secondary" className="mt-2">Доп. стоимость от 2 000 р./час</Badge>
                  </TabsContent>
                </Tabs>
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
                    <span className="font-medium">{productTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Источник фото</span>
                    <span className="font-medium">{photoSource === 'upload' ? 'Загрузка' : 'Фотограф'}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span className="text-primary" data-testid="price-total">{price} р.</span>
                </div>
                {photoSource === 'photographer' && (
                  <p className="text-xs text-muted-foreground">* Стоимость фотографа рассчитывается отдельно</p>
                )}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContinue}
                  data-testid="button-continue"
                >
                  {photoSource === 'upload' ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить фотографии
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Выбрать фотографа
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
