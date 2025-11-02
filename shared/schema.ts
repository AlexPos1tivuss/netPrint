import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Photographers table
export const photographers = pgTable("photographers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photo: text("photo").notNull(), // Path to photographer image
  specialization: text("specialization").notNull(),
  pricePerHour: integer("price_per_hour").notNull(), // Price in rubles
  rating: integer("rating").notNull().default(5), // 1-5 stars
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Product types: photoalbum, photos, calendar
export const productTypes = pgTable("product_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // photoalbum, photos, calendar
  displayName: text("display_name").notNull(), // Russian display name
  description: text("description").notNull(),
  basePrice: integer("base_price").notNull(), // Base price in rubles
  image: text("image").notNull(), // Path to product image
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productType: text("product_type").notNull(), // photoalbum, photos, calendar
  status: text("status").notNull().default("pending"), // pending, processing, ready, delivered
  totalPrice: integer("total_price").notNull(), // Total in rubles
  
  // Product configuration (stored as JSON)
  productConfig: jsonb("product_config").notNull(), // Dynamic parameters based on product type
  
  // Photo source: 'upload' or 'photographer'
  photoSource: text("photo_source").notNull(),
  
  // Photographer service details (if photoSource is 'photographer')
  photographerId: varchar("photographer_id").references(() => photographers.id),
  shootingDate: timestamp("shooting_date"),
  shootingTime: text("shooting_time"), // e.g., "14:00"
  shootingLocation: text("shooting_location"), // Address from Google Maps
  shootingCoordinates: jsonb("shooting_coordinates"), // {lat, lng}
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order photos (for uploaded photos)
export const orderPhotos = pgTable("order_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  photoPath: text("photo_path").notNull(), // Object storage path
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const photographersRelations = relations(photographers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  photographer: one(photographers, {
    fields: [orders.photographerId],
    references: [photographers.id],
  }),
  photos: many(orderPhotos),
}));

export const orderPhotosRelations = relations(orderPhotos, ({ one }) => ({
  order: one(orders, {
    fields: [orderPhotos.orderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPhotographerSchema = createInsertSchema(photographers).omit({
  id: true,
  createdAt: true,
});

export const insertProductTypeSchema = createInsertSchema(productTypes).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderPhotoSchema = createInsertSchema(orderPhotos).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Photographer = typeof photographers.$inferSelect;
export type ProductType = typeof productTypes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderPhoto = typeof orderPhotos.$inferSelect;
export type InsertPhotographer = z.infer<typeof insertPhotographerSchema>;
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderPhoto = z.infer<typeof insertOrderPhotoSchema>;

// Product configuration types
export type PhotoalbumConfig = {
  size: 'small' | 'medium' | 'large';
  coverType: 'soft' | 'hard' | 'premium';
  pages: number;
  paperType: 'matte' | 'glossy';
};

export type PhotosConfig = {
  size: '10x15' | '15x20' | '20x30';
  quantity: number;
  paperType: 'matte' | 'glossy';
  border: boolean;
};

export type CalendarConfig = {
  type: 'wall' | 'desk';
  size: 'A4' | 'A3';
  months: 12 | 6;
  binding: 'spiral' | 'glued';
};