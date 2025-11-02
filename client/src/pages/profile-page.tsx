import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, MapPin, User, Package } from "lucide-react";
import { Order } from "@shared/schema";
import logoImage from "@assets/generated_images/ФотоПринт_logo_modern_blue_239702b0.png";

const statusMap: Record<string, {label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline'}> = {
  pending: { label: 'В обработке', variant: 'secondary' },
  processing: { label: 'В производстве', variant: 'default' },
  ready: { label: 'Готов к выдаче', variant: 'outline' },
  delivered: { label: 'Доставлен', variant: 'outline' },
};

const productTypeMap: Record<string, string> = {
  photoalbum: 'Фотоальбом',
  photos: 'Фотографии',
  calendar: 'Календарь',
};

export default function ProfilePage() {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={logoImage} alt="ФотоПринт" className="h-10 cursor-pointer" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Мой профиль</h1>
            <p className="text-muted-foreground">
              Пользователь: <span className="font-medium">{user?.username}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Мои заказы</CardTitle>
              <CardDescription>
                История всех ваших заказов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Загрузка заказов...
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  У вас пока нет заказов
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover-elevate" data-testid={`order-${order.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold" data-testid={`text-product-${order.id}`}>
                                {productTypeMap[order.productType] || order.productType}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Заказ #{order.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={statusMap[order.status]?.variant || 'default'} data-testid={`status-${order.id}`}>
                            {statusMap[order.status]?.label || order.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-semibold">
                            <span>Стоимость:</span>
                            <span data-testid={`price-${order.id}`}>{order.totalPrice.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>

                        {order.photoSource === 'photographer' && order.photographerId && (
                          <>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Услуга фотографа заказана</span>
                              </div>
                              {order.shootingDate && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Дата съемки: {new Date(order.shootingDate).toLocaleDateString('ru-RU', {
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
                                  <MapPin className="w-4 h-4 mt-0.5" />
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