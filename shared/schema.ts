import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  llmCallCount: integer("llm_call_count").notNull().default(0),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  confidence: integer("confidence").notNull().default(0), // 0-100
  imageUrl: text("image_url").notNull(),
  imageData: text("image_data"), // base64 encoded image data
  purchaseDate: text("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const updateAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
}).partial();

export type User = typeof users.$inferSelect;
export type InsertUser = Pick<typeof users.$inferInsert, 'username' | 'password'>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = Omit<typeof assets.$inferInsert, 'id' | 'createdAt'>;
export type UpdateAsset = Partial<InsertAsset>;
