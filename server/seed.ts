import { db } from "./db";
import { users, photographers, productTypes, orders } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq, gte, sql } from "drizzle-orm";

const photographer1Image = "/attached_assets/generated_images/Professional_photographer_portrait_male_8402f3c7.png";
const photographer2Image = "/attached_assets/generated_images/Professional_photographer_portrait_female_b7ef2a0e.png";
const photographer3Image = "/attached_assets/generated_images/Professional_photographer_portrait_senior_e8e1c0f2.png";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin"),
    });

    if (!existingAdmin) {
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
      });
      console.log("Admin user created: username=admin, password=admin123");
    } else {
      console.log("Admin user already exists");
    }

    const existingPhotographers = await db.query.photographers.findMany();

    const photographersData = [
      {
        name: "Алексей Петров",
        photo: photographer1Image,
        specialization: "Свадебная и семейная фотография",
        pricePerHour: 120,
        rating: 5,
      },
      {
        name: "Мария Иванова",
        photo: photographer2Image,
        specialization: "Портретная и студийная съемка",
        pricePerHour: 90,
        rating: 5,
      },
      {
        name: "Дмитрий Соколов",
        photo: photographer3Image,
        specialization: "Репортажная и событийная фотография",
        pricePerHour: 70,
        rating: 4,
      },
    ];

    if (existingPhotographers.length === 0) {
      console.log("Creating photographers...");
      await db.insert(photographers).values(photographersData);
      console.log("Photographers created:", photographersData.length);
    } else {
      console.log("Updating photographers hourly rates to BYN...");
      for (const p of photographersData) {
        await db.update(photographers)
          .set({ pricePerHour: p.pricePerHour })
          .where(eq(photographers.name, p.name));
      }
    }

    // Fix product types - rename "prints" to "photos" if exists
    const printsProduct = await db.query.productTypes.findFirst({
      where: (productTypes, { eq }) => eq(productTypes.name, "prints"),
    });
    if (printsProduct) {
      console.log("Fixing product name: 'prints' -> 'photos'");
      await db.update(productTypes)
        .set({ name: "photos" })
        .where(eq(productTypes.name, "prints"));
    }

    // Seed product types if they don't exist
    const existingProducts = await db.query.productTypes.findMany();

    const productSeed = [
      {
        id: "pt-album",
        name: "photoalbum",
        displayName: "Фотоальбом",
        description: "Качественные фотоальбомы с твердой или мягкой обложкой",
        basePrice: 30,
        image: "/assets/album.jpg",
      },
      {
        id: "pt-photos",
        name: "photos",
        displayName: "Фотографии",
        description: "Печать фотографий различных форматов на глянцевой или матовой бумаге",
        basePrice: 1,
        image: "/assets/photos.jpg",
      },
      {
        id: "pt-calendar",
        name: "calendar",
        displayName: "Календарь",
        description: "Настенные и настольные календари с вашими фотографиями",
        basePrice: 15,
        image: "/assets/calendar.jpg",
      },
    ];

    if (existingProducts.length === 0) {
      console.log("Creating product types...");
      await db.insert(productTypes).values(productSeed);
      console.log("Product types created");
    } else {
      console.log("Updating product base prices to BYN...");
      for (const p of productSeed) {
        await db.update(productTypes)
          .set({ basePrice: p.basePrice })
          .where(eq(productTypes.name, p.name));
      }
    }

    // One-time migration: historical orders stored in RUB convert to BYN (~30:1).
    // Idempotent: any totalPrice >= 500 indicates a pre-BYN row (new BYN max realistic ~200).
    const legacyOrders = await db.query.orders.findMany({
      where: (o) => gte(o.totalPrice, 500),
      columns: { id: true },
    });
    if (legacyOrders.length > 0) {
      console.log(`Migrating ${legacyOrders.length} legacy RUB order totals to BYN...`);
      await db.execute(sql`UPDATE orders SET total_price = GREATEST(1, ROUND(total_price / 30.0))`);
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
