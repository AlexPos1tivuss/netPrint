import { 
  type User, 
  type InsertUser,
  type Photographer,
  type InsertPhotographer,
  type ProductType,
  type UpdateProductType,
  type Order,
  type InsertOrder,
  type OrderPhoto,
  type InsertOrderPhoto,
  users,
  photographers,
  productTypes,
  orders,
  orderPhotos,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllPhotographers(): Promise<Photographer[]>;
  getPhotographer(id: string): Promise<Photographer | undefined>;
  createPhotographer(photographer: InsertPhotographer): Promise<Photographer>;

  getAllProducts(): Promise<ProductType[]>;
  getProductByName(name: string): Promise<ProductType | undefined>;
  updateProduct(id: string, updates: UpdateProductType): Promise<ProductType | undefined>;

  getAllOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;

  addOrderPhoto(photo: InsertOrderPhoto): Promise<OrderPhoto>;
  getOrderPhotos(orderId: string): Promise<OrderPhoto[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllPhotographers(): Promise<Photographer[]> {
    return await db.select().from(photographers);
  }

  async getPhotographer(id: string): Promise<Photographer | undefined> {
    const result = await db.select().from(photographers).where(eq(photographers.id, id)).limit(1);
    return result[0];
  }

  async createPhotographer(photographer: InsertPhotographer): Promise<Photographer> {
    const result = await db.insert(photographers).values(photographer).returning();
    return result[0];
  }

  async getAllProducts(): Promise<ProductType[]> {
    return await db.select().from(productTypes);
  }

  async getProductByName(name: string): Promise<ProductType | undefined> {
    const result = await db.select().from(productTypes).where(eq(productTypes.name, name)).limit(1);
    return result[0];
  }

  async updateProduct(id: string, updates: UpdateProductType): Promise<ProductType | undefined> {
    const result = await db.update(productTypes)
      .set(updates)
      .where(eq(productTypes.id, id))
      .returning();
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return result[0];
  }

  async addOrderPhoto(photo: InsertOrderPhoto): Promise<OrderPhoto> {
    const result = await db.insert(orderPhotos).values(photo).returning();
    return result[0];
  }

  async getOrderPhotos(orderId: string): Promise<OrderPhoto[]> {
    return await db.select().from(orderPhotos).where(eq(orderPhotos.orderId, orderId));
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private photographers: Map<string, Photographer>;
  private products: Map<string, ProductType>;
  private orders: Map<string, Order>;
  private orderPhotos: Map<string, OrderPhoto>;

  constructor() {
    this.users = new Map();
    this.photographers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderPhotos = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllPhotographers(): Promise<Photographer[]> {
    return Array.from(this.photographers.values());
  }

  async getPhotographer(id: string): Promise<Photographer | undefined> {
    return this.photographers.get(id);
  }

  async createPhotographer(photographer: InsertPhotographer): Promise<Photographer> {
    const id = randomUUID();
    const newPhotographer: Photographer = {
      ...photographer,
      id,
      rating: photographer.rating ?? 5,
      createdAt: new Date(),
    };
    this.photographers.set(id, newPhotographer);
    return newPhotographer;
  }

  async getAllProducts(): Promise<ProductType[]> {
    return Array.from(this.products.values());
  }

  async getProductByName(name: string): Promise<ProductType | undefined> {
    return Array.from(this.products.values()).find(p => p.name === name);
  }

  async updateProduct(id: string, updates: UpdateProductType): Promise<ProductType | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated: ProductType = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      status: order.status ?? "pending",
      photographerId: order.photographerId ?? null,
      shootingDate: order.shootingDate ?? null,
      shootingTime: order.shootingTime ?? null,
      shootingLocation: order.shootingLocation ?? null,
      shootingCoordinates: order.shootingCoordinates ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.orders.set(orderId, order);
    }
    return order;
  }

  async addOrderPhoto(photo: InsertOrderPhoto): Promise<OrderPhoto> {
    const id = randomUUID();
    const newPhoto: OrderPhoto = {
      ...photo,
      id,
      uploadedAt: new Date(),
    };
    this.orderPhotos.set(id, newPhoto);
    return newPhoto;
  }

  async getOrderPhotos(orderId: string): Promise<OrderPhoto[]> {
    return Array.from(this.orderPhotos.values())
      .filter(photo => photo.orderId === orderId);
  }
}

export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();