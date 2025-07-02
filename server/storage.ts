import { users, assets, type User, type InsertUser, type Asset, type InsertAsset, type UpdateAsset } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assets: Map<number, Asset>;
  private currentUserId: number;
  private currentAssetId: number;

  constructor() {
    this.users = new Map();
    this.assets = new Map();
    this.currentUserId = 1;
    this.currentAssetId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentAssetId++;
    const asset: Asset = {
      ...insertAsset,
      id,
      createdAt: new Date().toISOString(),
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, updateAsset: UpdateAsset): Promise<Asset | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;

    const updated: Asset = {
      ...existing,
      ...updateAsset,
    };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  async searchAssets(query: string): Promise<Asset[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.assets.values()).filter(asset =>
      asset.name.toLowerCase().includes(lowercaseQuery) ||
      asset.category.toLowerCase().includes(lowercaseQuery) ||
      asset.notes?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    if (category === "all") return this.getAssets();
    return Array.from(this.assets.values()).filter(asset =>
      asset.category === category
    );
  }
}

export const storage = new MemStorage();
