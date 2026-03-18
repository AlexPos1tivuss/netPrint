import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Check, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import sprinterLogo from "@assets/sprinter-logo.svg";

export default function UploadPhotosPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const productType = params.get('product') || '';
  const price = params.get('price') || '0';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = uploadedFiles.length + files.length;
    
    if (totalFiles > 20) {
      toast({
        title: "Превышен лимит",
        description: "Максимум 20 фотографий",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'image/jpeg' || f.type === 'image/png'
    );
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles > 20) {
      toast({
        title: "Превышен лимит",
        description: "Максимум 20 фотографий",
        variant: "destructive",
      });
      return;
    }
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createOrderMutation = useMutation({
    mutationFn: async (uploadedPaths: string[]) => {
      const params = new URLSearchParams(window.location.search);
      const productType = params.get('product') || '';
      const price = parseInt(params.get('price') || '0');
      
      const storedConfig = sessionStorage.getItem('productConfig');
      const config = storedConfig ? JSON.parse(storedConfig) : {};
      const productConfig = config.config || {};
      
      const res = await apiRequest("POST", "/api/orders", {
        productType,
        totalPrice: price,
        photoSource: 'upload',
        productConfig,
        uploadedPhotoPaths: uploadedPaths,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      sessionStorage.removeItem('productConfig');
      toast({
        title: "Заказ создан!",
        description: "Ваш заказ успешно оформлен. Вы можете отслеживать его в профиле.",
      });
      navigate('/profile');
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ. Попробуйте ещё раз.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Загрузите фото",
        description: "Необходимо загрузить хотя бы одну фотографию",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadedPaths: string[] = [];
      
      for (const file of uploadedFiles) {
        const urlResponse = await apiRequest("POST", "/api/upload/signed-url", {
          fileName: file.name,
          contentType: file.type,
        });
        const { signedUrl, filePath } = await urlResponse.json();
        
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        
        uploadedPaths.push(filePath);
      }
      
      createOrderMutation.mutate(uploadedPaths);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фотографии. Проверьте подключение и попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isProcessing = uploading || createOrderMutation.isPending;

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
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/product/${productType}`)} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к настройкам
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Загрузка фотографий</h1>
            <p className="text-muted-foreground">
              Загрузите ваши фотографии для печати (максимум 20 штук)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Выберите фотографии</CardTitle>
                  <CardDescription>
                    Поддерживаются форматы: JPG, PNG. Размер файла до 10 МБ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label 
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover-elevate transition-all"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    data-testid="upload-zone"
                  >
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="p-3 rounded-full bg-primary/10 mb-3">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground">Нажмите для выбора</span> или перетащите файлы
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadedFiles.length} / 20 фотографий загружено
                      </p>
                    </div>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handleFileSelect}
                      data-testid="input-file"
                    />
                  </label>
                </CardContent>
              </Card>

              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Загруженные фотографии ({uploadedFiles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {uploadedFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className="relative group aspect-square"
                          data-testid={`photo-${index}`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md" />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-remove-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm rounded-b-md px-2 py-1 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.name}
                          </div>
                        </div>
                      ))}

                      {uploadedFiles.length < 20 && (
                        <label 
                          htmlFor="file-upload-more"
                          className="aspect-square border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover-elevate text-muted-foreground"
                        >
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-xs">Добавить</span>
                          <input 
                            id="file-upload-more" 
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg,image/png"
                            multiple
                            onChange={handleFileSelect}
                          />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Итого</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Стоимость продукта</span>
                      <span className="font-medium">{price} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фотографий</span>
                      <span className="font-medium">{uploadedFiles.length}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Итого</span>
                      <span className="text-primary">{price} ₽</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={uploadedFiles.length === 0 || isProcessing}
                      data-testid="button-create-order"
                    >
                      {isProcessing ? (
                        uploading ? "Загрузка фото..." : "Создание заказа..."
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Оформить заказ
                        </>
                      )}
                    </Button>
                    {uploadedFiles.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Загрузите хотя бы одну фотографию
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
