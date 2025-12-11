import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { Camera, User, LogOut, Shield, Settings } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductType, UpdateProductType } from "@shared/schema";
import logoSvg from "@assets/netprint-logo.svg";
import photoalbumImage from "@assets/generated_images/Premium_hardcover_photo_album_6ecc0eee.png";
import photosImage from "@assets/generated_images/Stack_glossy_photo_prints_3ba30edf.png";
import calendarImage from "@assets/generated_images/Modern_wall_calendar_2025_6ee0d16e.png";

const productImages: Record<string, string> = {
  photoalbum: photoalbumImage,
  photos: photosImage,
  prints: photosImage,
  calendar: calendarImage,
};

const updateSchema = z.object({
  displayName: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  basePrice: z.coerce.number().min(0, "Цена должна быть положительной"),
  image: z.string().min(1, "URL изображения обязательно"),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function CatalogPage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  const { data: products, isLoading } = useQuery<ProductType[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      displayName: "",
      description: "",
      basePrice: 0,
      image: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: UpdateProductType }) => {
      await apiRequest("PATCH", `/api/products/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: "Успешно",
        description: "Продукт обновлен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить продукт",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    form.reset({
      displayName: product.displayName,
      description: product.description,
      basePrice: product.basePrice,
      image: product.image,
    });
  };

  const handleSubmit = (data: UpdateFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate({
      id: editingProduct.id,
      updates: data,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/catalog">
            <img src={logoSvg} alt="Netprint" className="h-8 cursor-pointer" data-testid="logo-image" />
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-username">
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

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {products?.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden"
                  data-testid={`card-product-${product.name}`}
                >
                  <div 
                    className="aspect-square overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product.name}`)}
                  >
                    <img 
                      src={productImages[product.name] || product.image} 
                      alt={product.displayName}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      data-testid={`img-product-${product.name}`}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.displayName}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">от </span>
                      <span className="text-2xl font-bold text-primary" data-testid={`text-price-${product.name}`}>
                        {product.basePrice} ₽
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/product/${product.name}`)}
                        data-testid={`button-configure-${product.name}`}
                      >
                        Настроить
                      </Button>
                      {user?.isAdmin && (
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                          data-testid={`button-edit-${product.name}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Photographer CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Camera className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-3xl font-bold mb-4">
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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent data-testid="dialog-edit-product">
          <DialogHeader>
            <DialogTitle>Настройка продукта</DialogTitle>
            <DialogDescription>
              Измените название, описание, цену или изображение продукта
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-displayName" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (₽)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-basePrice" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-image" />
                    </FormControl>
                    <FormDescription>
                      Полный URL изображения продукта
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingProduct(null)}
                  data-testid="button-cancel"
                >
                  Отменить
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
