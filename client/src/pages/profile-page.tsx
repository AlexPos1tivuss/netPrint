import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, LogOut, MapPin, User, Package, Shield, ImageIcon } from "lucide-react";
import { OrderWithPhotos, ProductType } from "@shared/schema";
import sprinterLogo from "@assets/sprinter-logo.svg";

const statusMap: Record<string, {label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline'}> = {
  pending: { label: 'В обработке', variant: 'secondary' },
  processing: { label: 'В производстве', variant: 'default' },
  ready: { label: 'Готов к выдаче', variant: 'outline' },
  delivered: { label: 'Доставлен', variant: 'outline' },
};

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  const { data: orders, isLoading } = useQuery<OrderWithPhotos[]>({
    queryKey: ['/api/orders'],
  });

  const { data: products } = useQuery<ProductType[]>({
    queryKey: ['/api/products'],
  });

  const getProductDisplayName = (productType: string) => {
    if (products) {
      const found = products.find(p => p.name === productType);
      if (found) return found.displayName;
    }
    return productType;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/catalog">
            <img src={sprinterLogo} alt="S-Printer" className="h-8 cursor-pointer" data-testid="logo-image" />
          </Link>
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" data-testid="link-admin">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Админ</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Выход</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/catalog">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К каталогу
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-profile-title">Мой профиль</h1>
              <div className="text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>Пользователь: <span className="font-medium" data-testid="text-username">{user?.username}</span></span>
                {user?.isAdmin && (
                  <Badge variant="secondary">Администратор</Badge>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>История заказов</CardTitle>
              <CardDescription>
                {orders?.length ? `Всего заказов: ${orders.length}` : 'Ваши заказы появятся здесь'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 bg-muted rounded-md animate-pulse" />
                  ))}
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground">У вас пока нет заказов</p>
                  <Link href="/catalog">
                    <Button variant="outline" size="sm" data-testid="button-to-catalog">
                      Перейти к каталогу
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover-elevate" data-testid={`order-${order.id}`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold" data-testid={`text-product-${order.id}`}>
                                {getProductDisplayName(order.productType)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Заказ #{order.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={statusMap[order.status]?.variant || 'default'}
                            data-testid={`status-${order.id}`}
                          >
                            {statusMap[order.status]?.label || order.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="text-muted-foreground font-normal">Стоимость:</span>
                            <span className="text-primary" data-testid={`price-${order.id}`}>
                              {order.totalPrice.toLocaleString('ru-RU')} р.
                            </span>
                          </div>
                        </div>

                        {order.photoSource === 'upload' && order.photos && order.photos.length > 0 && (
                          <>
                            <Separator className="my-3" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ImageIcon className="w-4 h-4 flex-shrink-0" />
                              <span>Загружено фотографий: {order.photos.length}</span>
                            </div>
                          </>
                        )}

                        {order.photoSource === 'photographer' && order.photographerId && (
                          <>
                            <Separator className="my-3" />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Услуга фотографа заказана</span>
                              </div>
                              {order.shootingDate && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(order.shootingDate).toLocaleDateString('ru-RU', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                    {order.shootingTime && ` в ${order.shootingTime}`}
                                  </span>
                                </div>
                              )}
                              {order.shootingLocation && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>{order.shootingLocation}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
