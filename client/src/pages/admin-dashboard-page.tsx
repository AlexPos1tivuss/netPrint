import { useState, Fragment } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Package, Users, TrendingUp, DollarSign, Image, ChevronDown, ChevronUp } from "lucide-react";
import { Order, OrderPhoto } from "@shared/schema";
import logoSvg from "@assets/netprint-logo.svg";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Redirect if not admin (after all hooks)
  if (user && !user.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });

  const { data: orderPhotos } = useQuery<OrderPhoto[]>({
    queryKey: ['/api/admin/orders', expandedOrderId, 'photos'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!expandedOrderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Статус обновлен",
        description: "Статус заказа успешно изменен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    },
  });

  const stats = orders ? {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    todayOrders: orders.filter(o => {
      const today = new Date();
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    }).length,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={logoSvg} alt="ФотоПринт" className="h-10 cursor-pointer" />
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

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Административная панель</h1>
            <p className="text-muted-foreground">
              Управление заказами и статистика магазина
            </p>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-orders">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Заказов за все время
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Выручка</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-revenue">
                    {stats.totalRevenue.toLocaleString('ru-RU')} ₽
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Общая выручка
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">В обработке</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-pending">
                    {stats.pendingOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ожидают обработки
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-today">
                    {stats.todayOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Заказов сегодня
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Все заказы</CardTitle>
              <CardDescription>
                Просмотр и управление всеми заказами
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Загрузка заказов...
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Заказов пока нет
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>ID заказа</TableHead>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Продукт</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <Fragment key={order.id}>
                          <TableRow data-testid={`row-order-${order.id}`}>
                            <TableCell>
                              {order.photoSource === 'upload' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                  data-testid={`button-expand-${order.id}`}
                                >
                                  {expandedOrderId === order.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>{order.userId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {productTypeMap[order.productType] || order.productType}
                                {order.photoSource === 'upload' && (
                                  <Badge variant="outline" className="text-xs">
                                    <Image className="h-3 w-3 mr-1" />
                                    Фото
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {order.totalPrice.toLocaleString('ru-RU')} ₽
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(status) => 
                                  updateStatusMutation.mutate({ orderId: order.id, status })
                                }
                              >
                                <SelectTrigger className="w-[180px]" data-testid={`select-status-${order.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">В обработке</SelectItem>
                                  <SelectItem value="processing">В производстве</SelectItem>
                                  <SelectItem value="ready">Готов к выдаче</SelectItem>
                                  <SelectItem value="delivered">Доставлен</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                          {expandedOrderId === order.id && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-muted/30 p-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Прикрепленные фотографии:</p>
                                  {orderPhotos && orderPhotos.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {orderPhotos.map((photo) => (
                                        <div 
                                          key={photo.id} 
                                          className="relative group cursor-pointer"
                                          onClick={() => setSelectedPhotoUrl(photo.photoPath)}
                                          data-testid={`photo-${photo.id}`}
                                        >
                                          <img
                                            src={photo.photoPath}
                                            alt="Фото заказа"
                                            className="h-20 w-20 object-cover rounded-md border hover:border-primary transition-colors"
                                          />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                            <Image className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Нет прикрепленных фотографий</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhotoUrl} onOpenChange={(open) => !open && setSelectedPhotoUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Просмотр фотографии</DialogTitle>
            <DialogDescription>
              Прикрепленная фотография к заказу
            </DialogDescription>
          </DialogHeader>
          {selectedPhotoUrl && (
            <img
              src={selectedPhotoUrl}
              alt="Фото заказа"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}