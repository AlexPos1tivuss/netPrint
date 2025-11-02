import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/generated_images/ФотоПринт_logo_modern_blue_239702b0.png";

export default function UploadPhotosPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Get params from URL
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

    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams(window.location.search);
      const productType = params.get('product') || '';
      const price = parseInt(params.get('price') || '0');
      
      // Get product config and uploaded photo paths from sessionStorage
      const storedConfig = sessionStorage.getItem('productConfig');
      const config = storedConfig ? JSON.parse(storedConfig) : {};
      const productConfig = config.config || {};
      const uploadedPhotoPaths = config.uploadedPhotoPaths || [];
      
      // Create order with uploaded photos
      const res = await apiRequest("POST", "/api/orders", {
        productType,
        totalPrice: price,
        photoSource: 'upload',
        productConfig,
        uploadedPhotoPaths,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Заказ создан!",
        description: "Ваш заказ успешно оформлен",
      });
      navigate('/profile');
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ",
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
      // Upload each file to object storage
      const uploadedPaths: string[] = [];
      
      for (const file of uploadedFiles) {
        // Get signed upload URL from backend
        const urlResponse = await apiRequest("POST", "/api/upload/signed-url", {
          fileName: file.name,
          contentType: file.type,
        });
        const { signedUrl, filePath } = await urlResponse.json();
        
        // Upload file directly to object storage with matching content type
        await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
        
        uploadedPaths.push(filePath);
      }
      
      // Store uploaded file paths in sessionStorage to pass to order creation
      const storedConfig = sessionStorage.getItem('productConfig');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        config.uploadedPhotoPaths = uploadedPaths;
        sessionStorage.setItem('productConfig', JSON.stringify(config));
      }
      
      // Create the order
      createOrderMutation.mutate();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фотографии",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/product/${productType}`)} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Загрузка фотографий</h1>
            <p className="text-muted-foreground">
              Загрузите ваши фотографии для печати (максимум 20 штук)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Zone */}
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
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate active-elevate-2 transition-all"
                    data-testid="upload-zone"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Нажмите для выбора</span> или перетащите файлы
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

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Загруженные фотографии ({uploadedFiles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className="relative group aspect-square"
                          data-testid={`photo-${index}`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-remove-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Итого</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Стоимость продукта</span>
                      <span>{price} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фотографий</span>
                      <span>{uploadedFiles.length}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Итого</span>
                      <span>{price} ₽</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={uploadedFiles.length === 0 || uploading || createOrderMutation.isPending}
                      data-testid="button-create-order"
                    >
                      {uploading || createOrderMutation.isPending ? (
                        "Создание заказа..."
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Оформить заказ
                        </>
                      )}
                    </Button>
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