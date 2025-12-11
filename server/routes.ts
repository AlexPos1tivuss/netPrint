import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema, updateProductTypeSchema } from "@shared/schema";
import { generateSignedUploadUrl } from "./object-storage";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Требуется авторизация");
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).send("Требуются права администратора");
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/upload/signed-url", requireAuth, async (req, res) => {
    try {
      const { fileName, contentType } = req.body;
      if (!fileName || !contentType) {
        return res.status(400).send("Имя файла и тип содержимого не указаны");
      }

      const { signedUrl, filePath } = await generateSignedUploadUrl(fileName, contentType);
      res.json({ signedUrl, filePath });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      res.status(500).send("Ошибка создания URL для загрузки");
    }
  });

  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Ошибка получения списка продуктов");
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const result = updateProductTypeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send("Неверные данные продукта");
      }

      const updated = await storage.updateProduct(req.params.id, result.data);
      if (!updated) {
        return res.status(404).send("Продукт не найден");
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Ошибка обновления продукта");
    }
  });

  app.get("/api/photographers", requireAuth, async (req, res) => {
    try {
      const photographers = await storage.getAllPhotographers();
      res.json(photographers);
    } catch (error) {
      console.error("Error fetching photographers:", error);
      res.status(500).send("Ошибка получения списка фотографов");
    }
  });

  app.get("/api/photographers/:id", requireAuth, async (req, res) => {
    try {
      const photographer = await storage.getPhotographer(req.params.id);
      if (!photographer) {
        return res.status(404).send("Фотограф не найден");
      }
      res.json(photographer);
    } catch (error) {
      console.error("Error fetching photographer:", error);
      res.status(500).send("Ошибка получения фотографа");
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Ошибка получения заказов");
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const { uploadedPhotoPaths, ...orderData } = req.body;
      
      const result = insertOrderSchema.safeParse({
        ...orderData,
        userId: req.user!.id,
      });

      if (!result.success) {
        console.error("Order validation failed:", JSON.stringify(result.error.issues, null, 2));
        console.error("Received order data:", JSON.stringify({ ...orderData, userId: req.user!.id }, null, 2));
        return res.status(400).send("Неверные данные заказа");
      }

      const order = await storage.createOrder(result.data);
      
      if (uploadedPhotoPaths && Array.isArray(uploadedPhotoPaths)) {
        for (const photoPath of uploadedPhotoPaths) {
          await storage.addOrderPhoto({
            orderId: order.id,
            photoPath,
          });
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).send("Ошибка создания заказа");
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).send("Заказ не найден");
      }

      if (order.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Доступ запрещен");
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).send("Ошибка получения заказа");
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).send("Ошибка получения всех заказов");
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).send("Статус не указан");
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).send("Заказ не найден");
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).send("Ошибка обновления статуса заказа");
    }
  });

  app.get("/api/admin/orders/:orderId/photos", requireAdmin, async (req, res) => {
    try {
      const photos = await storage.getOrderPhotos(req.params.orderId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching order photos:", error);
      res.status(500).send("Ошибка получения фотографий заказа");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}