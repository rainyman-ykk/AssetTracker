import { users, assets, type User, type InsertUser, type Asset, type InsertAsset, type UpdateAsset } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Asset methods
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: UpdateAsset): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  searchAssets(query: string): Promise<Asset[]>;
  getAssetsByCategory(category: string): Promise<Asset[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAssets(): Promise<Asset[]> {
    const result = await db
      .select()
      .from(assets)
      .orderBy(assets.createdAt);
    return result;
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset || undefined;
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db
      .insert(assets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updateAsset(id: number, updateAsset: UpdateAsset): Promise<Asset | undefined> {
    const [asset] = await db
      .update(assets)
      .set(updateAsset)
      .where(eq(assets.id, id))
      .returning();
    return asset || undefined;
  }

  async deleteAsset(id: number): Promise<boolean> {
    const result = await db
      .delete(assets)
      .where(eq(assets.id, id))
      .returning();
    return result.length > 0;
  }

  async searchAssets(query: string): Promise<Asset[]> {
    const result = await db
      .select()
      .from(assets)
      .where(
        or(
          ilike(assets.name, `%${query}%`),
          ilike(assets.category, `%${query}%`),
          ilike(assets.notes, `%${query}%`)
        )
      )
      .orderBy(assets.createdAt);
    return result;
  }

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    if (category === "all") return this.getAssets();
    
    const result = await db
      .select()
      .from(assets)
      .where(eq(assets.category, category))
      .orderBy(assets.createdAt);
    return result;
  }
}

export const storage = new DatabaseStorage();
