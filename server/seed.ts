import { db } from "./db";
import { users, photographers } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Image paths (these will be served by the frontend)
const photographer1Image = "/attached_assets/generated_images/Professional_photographer_portrait_male_b6dc45aa.png";
const photographer2Image = "/attached_assets/generated_images/Professional_photographer_portrait_female_1ebc04cc.png";
const photographer3Image = "/attached_assets/generated_images/Professional_photographer_portrait_male_2_f5a20f3c.png";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Check if admin user exists
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

    // Check if photographers exist
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

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}