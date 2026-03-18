import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Package, Users, TrendingUp, DollarSign, Clock, LogOut } from "lucide-react";
import { Order } from "@shared/schema";
import sprinterLogo from "@assets/sprinter-logo.svg";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusMap: Record<string, {label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline'}> = {
  pending: { label: 'В обработке', variant: 'secondary' },
  processing: { label: 'В производстве', variant: 'default' },
  ready: { label: 'Готов', variant: 'outline' },
  delivered: { label: 'Доставлен', variant: 'outline' },
};

const productTypeMap: Record<string, string> = {
  photoalbum: 'Фотоальбом',
  photos: 'Фотографии',
  prints: 'Фотографии',
  calendar: 'Календарь',
};

export default function AdminDashboardPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  if (user && !user.isAdmin) {
    return <Redirect to="/catalog" />;
  }

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
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
    processingOrders: orders.filter(o => o.status === 'processing').length,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/catalog">
            <img src={sprinterLogo} alt="S-Printer" className="h-8 cursor-pointer" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Администратор: {user?.username}
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

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Административная панель</h1>
            <p className="text-muted-foreground">
              Управление заказами и статистика
            </p>
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
                  {isLoading ? "—" : stats?.totalOrders ?? 0}
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
                  {isLoading ? "—" : `${(stats?.totalRevenue ?? 0).toLocaleString('ru-RU')} ₽`}
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
                  {isLoading ? "—" : stats?.pendingOrders ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-processing">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">В производстве</p>
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : stats?.processingOrders ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Все заказы</CardTitle>
              <CardDescription>
                {orders?.length ? `Найдено заказов: ${orders.length}` : 'Заказов пока нет'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
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
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {productTypeMap[order.productType] || order.productType}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {order.userId.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {order.totalPrice.toLocaleString('ru-RU')} ₽
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusMap[order.status]?.variant || 'default'}
                              data-testid={`status-${order.id}`}
                            >
                              {statusMap[order.status]?.label || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => {
                                updateStatusMutation.mutate({
                                  orderId: order.id,
                                  status: newStatus,
                                });
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
        </div>
      </div>
    </div>
  );
}
