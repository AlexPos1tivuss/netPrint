import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Users, TrendingUp, DollarSign, Clock, LogOut, Shield, Calendar, MapPin, User as UserIcon, Camera, Image } from "lucide-react";
import type { OrderWithPhotos, User, ProductType } from "@shared/schema";
import sprinterLogo from "@assets/sprinter-logo.svg";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusMap: Record<string, {label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline'}> = {
  pending: { label: 'В обработке', variant: 'secondary' },
  processing: { label: 'В производстве', variant: 'default' },
  ready: { label: 'Готов', variant: 'outline' },
  delivered: { label: 'Доставлен', variant: 'outline' },
};

type SafeUser = Omit<User, 'password'>;

export default function AdminDashboardPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithPhotos | null>(null);

  if (user && !user.isAdmin) {
    return <Redirect to="/catalog" />;
  }

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithPhotos[]>({
    queryKey: ['/api/admin/orders'],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery<SafeUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductType[]>({
    queryKey: ['/api/products'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? {...prev, status: orders?.find(o => o.id === prev.id)?.status || prev.status} : null);
      }
      toast({ title: "Статус обновлен" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить статус", variant: "destructive" });
    },
  });

  const getProductDisplayName = (productType: string) => {
    if (products) {
      const found = products.find(p => p.name === productType);
      if (found) return found.displayName;
    }
    return productType;
  };

  const stats = orders ? {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/catalog">
              <img src={sprinterLogo} alt="S-Printer" className="h-8 cursor-pointer" />
            </Link>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Администратор
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.username}
            </span>
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

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Административная панель</h1>
            <p className="text-muted-foreground">Управление заказами, пользователями и продуктами</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="stat-total-orders">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Всего заказов</p>
                  <div className="p-2 rounded-md bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {ordersLoading ? "—" : stats?.totalOrders ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-revenue">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Выручка</p>
                  <div className="p-2 rounded-md bg-green-500/10">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {ordersLoading ? "—" : `${(stats?.totalRevenue ?? 0).toLocaleString('ru-RU')} р.`}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-pending">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">В обработке</p>
                  <div className="p-2 rounded-md bg-yellow-500/10">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {ordersLoading ? "—" : stats?.pendingOrders ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-users">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Пользователей</p>
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {usersLoading ? "—" : allUsers?.length ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders" data-testid="tab-orders">
                <Package className="h-4 w-4 mr-2" />
                Заказы
                {stats?.pendingOrders ? (
                  <Badge variant="default" className="ml-2 text-xs">{stats.pendingOrders}</Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="h-4 w-4 mr-2" />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">
                <Image className="h-4 w-4 mr-2" />
                Продукты
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Управление заказами</CardTitle>
                  <CardDescription>
                    {orders?.length ? `Всего заказов: ${orders.length}` : 'Заказов пока нет'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : !orders || orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">Заказов пока нет</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID заказа</TableHead>
                            <TableHead>Продукт</TableHead>
                            <TableHead className="hidden md:table-cell">Дата</TableHead>
                            <TableHead className="text-right">Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Изменить статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                              data-testid={`row-order-${order.id}`}
                            >
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                #{order.id.slice(0, 8)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {getProductDisplayName(order.productType)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap hidden md:table-cell">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                })}
                              </TableCell>
                              <TableCell className="text-right font-semibold whitespace-nowrap">
                                {order.totalPrice.toLocaleString('ru-RU')} р.
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={statusMap[order.status]?.variant || 'default'}
                                  data-testid={`status-${order.id}`}
                                >
                                  {statusMap[order.status]?.label || order.status}
                                </Badge>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={order.status}
                                  onValueChange={(newStatus) => {
                                    updateStatusMutation.mutate({ orderId: order.id, status: newStatus });
                                  }}
                                >
                                  <SelectTrigger
                                    className="w-36"
                                    data-testid={`select-status-${order.id}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">В обработке</SelectItem>
                                    <SelectItem value="processing">В производстве</SelectItem>
                                    <SelectItem value="ready">Готов</SelectItem>
                                    <SelectItem value="delivered">Доставлен</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Пользователи системы</CardTitle>
                  <CardDescription>
                    {allUsers?.length ? `Зарегистрировано пользователей: ${allUsers.length}` : 'Нет данных'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : !allUsers || allUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">Нет пользователей</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Роль</TableHead>
                            <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                            <TableHead className="text-right">Заказов</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allUsers.map((u) => {
                            const userOrders = orders?.filter(o => o.userId === u.id) || [];
                            return (
                              <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <UserIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{u.username}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={u.isAdmin ? 'default' : 'secondary'}>
                                    {u.isAdmin ? 'Администратор' : 'Пользователь'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                  {new Date(u.createdAt).toLocaleDateString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {userOrders.length}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Каталог продуктов</CardTitle>
                  <CardDescription>
                    Продукты в системе. Настройте цены и описания в каталоге.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Продукт</TableHead>
                            <TableHead>Системное имя</TableHead>
                            <TableHead className="text-right">Базовая цена</TableHead>
                            <TableHead className="text-right hidden md:table-cell">Заказов</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products?.map((product) => {
                            const productOrders = orders?.filter(o => 
                              o.productType === product.name || 
                              (product.name === 'photos' && o.productType === 'prints')
                            ) || [];
                            return (
                              <TableRow key={product.id} data-testid={`row-product-${product.name}`}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{product.displayName}</p>
                                      <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {product.name}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {product.basePrice.toLocaleString('ru-RU')} р.
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                  {productOrders.length}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Для изменения цен и описания продуктов перейдите в <Link href="/catalog" className="underline">каталог</Link> и нажмите иконку настроек.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Детали заказа</SheetTitle>
                <SheetDescription>
                  #{selectedOrder.id.slice(0, 8)} · {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Статус заказа</p>
                    <Badge variant={statusMap[selectedOrder.status]?.variant || 'default'}>
                      {statusMap[selectedOrder.status]?.label || selectedOrder.status}
                    </Badge>
                  </div>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(newStatus) => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus });
                      setSelectedOrder(prev => prev ? {...prev, status: newStatus} : null);
                    }}
                  >
                    <SelectTrigger className="w-40" data-testid="select-status-detail">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">В обработке</SelectItem>
                      <SelectItem value="processing">В производстве</SelectItem>
                      <SelectItem value="ready">Готов</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Информация о заказе</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Продукт</p>
                      <p className="font-medium">{getProductDisplayName(selectedOrder.productType)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Итого</p>
                      <p className="font-medium text-primary">{selectedOrder.totalPrice.toLocaleString('ru-RU')} р.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Источник фото</p>
                      <p className="font-medium">{selectedOrder.photoSource === 'upload' ? 'Загрузка' : 'Фотограф'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID пользователя</p>
                      <p className="font-mono text-xs">{selectedOrder.userId.slice(0, 12)}...</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.productConfig != null && typeof selectedOrder.productConfig === 'object' && Object.keys(selectedOrder.productConfig as Record<string, unknown>).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Конфигурация продукта</h3>
                      <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                        {Object.entries(selectedOrder.productConfig as Record<string, string | number | boolean | null>).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedOrder.photoSource === 'upload' && selectedOrder.photos && selectedOrder.photos.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Загруженные фотографии
                      </h3>
                      <div className="bg-muted rounded-md p-3 text-sm">
                        <p className="text-muted-foreground mb-2">
                          Количество файлов: <span className="font-medium text-foreground">{selectedOrder.photos.length}</span>
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedOrder.photos.map((photo) => (
                            <p key={photo.id} className="font-mono text-xs text-muted-foreground truncate">
                              {photo.photoPath.split('/').pop()}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedOrder.photoSource === 'photographer' && selectedOrder.photographerId && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Услуга фотографа
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.shootingDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              {new Date(selectedOrder.shootingDate).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                              {selectedOrder.shootingTime && ` в ${selectedOrder.shootingTime}`}
                            </span>
                          </div>
                        )}
                        {selectedOrder.shootingLocation && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span>{selectedOrder.shootingLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
