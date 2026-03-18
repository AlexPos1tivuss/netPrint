import { db } from "./db";
import { users, photographers, productTypes } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

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
    
    if (existingPhotographers.length === 0) {
      console.log("Creating photographers...");
      
      const photographersData = [
        {
          name: "Алексей Петров",
          photo: photographer1Image,
          specialization: "Свадебная и семейная фотография",
          pricePerHour: 3000,
          rating: 5,
        },
        {
          name: "Мария Иванова",
          photo: photographer2Image,
          specialization: "Портретная и студийная съемка",
          pricePerHour: 2500,
          rating: 5,
        },
        {
          name: "Дмитрий Соколов",
          photo: photographer3Image,
          specialization: "Репортажная и событийная фотография",
          pricePerHour: 2000,
          rating: 4,
        },
      ];

      await db.insert(photographers).values(photographersData);
      console.log("Photographers created:", photographersData.length);
    } else {
      console.log("Photographers already exist:", existingPhotographers.length);
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
    
    if (existingProducts.length === 0) {
      console.log("Creating product types...");
      await db.insert(productTypes).values([
        {
          id: "pt-album",
          name: "photoalbum",
          displayName: "Фотоальбом",
          description: "Качественные фотоальбомы с твердой или мягкой обложкой",
          basePrice: 1500,
          image: "/assets/album.jpg",
        },
        {
          id: "pt-photos",
          name: "photos",
          displayName: "Фотографии",
          description: "Печать фотографий различных форматов на глянцевой или матовой бумаге",
          basePrice: 10,
          image: "/assets/photos.jpg",
        },
        {
          id: "pt-calendar",
          name: "calendar",
          displayName: "Календарь",
          description: "Настенные и настольные календари с вашими фотографиями",
          basePrice: 800,
          image: "/assets/calendar.jpg",
        },
      ]);
      console.log("Product types created");
    } else {
      console.log("Product types already exist:", existingProducts.length);
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
