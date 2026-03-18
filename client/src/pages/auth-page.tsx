import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mail, Lock } from "lucide-react";
import sprinterLogo from "@assets/sprinter-logo.svg";

export default function AuthPage() {
  const { user, loginMutation, logoutMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  if (user) {
    return <Redirect to="/catalog" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password,
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <img src={sprinterLogo} alt="S-Printer" className="h-14 mx-auto" />
            <h1 className="text-2xl font-bold">Добро пожаловать</h1>
            <p className="text-muted-foreground">Войдите или создайте аккаунт</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Вход</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Вход в систему</CardTitle>
                    <CardDescription>Введите ваши учетные данные</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Имя пользователя</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-username"
                          data-testid="input-login-username"
                          type="text"
                          placeholder="Введите имя пользователя"
                          className="pl-9"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          data-testid="input-login-password"
                          type="password"
                          placeholder="Введите пароль"
                          className="pl-9"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Вход..." : "Войти"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle>Создать аккаунт</CardTitle>
                    <CardDescription>Заполните форму для регистрации</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Имя пользователя</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-username"
                          data-testid="input-register-username"
                          type="text"
                          placeholder="Выберите имя пользователя"
                          className="pl-9"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Пароль</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          data-testid="input-register-password"
                          type="password"
                          placeholder="Создайте пароль"
                          className="pl-9"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm"
                          data-testid="input-register-confirm"
                          type="password"
                          placeholder="Повторите пароль"
                          className="pl-9"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    {registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                      <p className="text-sm text-destructive">Пароли не совпадают</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending || registerData.password !== registerData.confirmPassword}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/70 items-center justify-center p-12 text-white">
        <div className="max-w-md space-y-6 text-center">
          <Camera className="w-20 h-20 mx-auto opacity-90" />
          <h2 className="text-2xl font-bold">Профессиональная фотопечать</h2>
          <p className="text-lg opacity-90">
            Фотоальбомы, фотографии и календари — быстро и качественно
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
              <p>Высокое качество печати</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
              <p>Быстрая доставка</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
              <p>Услуги профессиональных фотографов</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
              <p>Тысячи довольных клиентов</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
