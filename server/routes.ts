import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssetSchema, updateAssetSchema } from "@shared/schema";
import multer from "multer";
import { mockAnalyzeImage } from "./analyze";
import { checkLlmLimit } from "./llm-limit";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all assets
  app.get("/api/assets", async (req: Request, res: Response) => {
    try {
      const { category, search, sort } = req.query;

      let assets;
      if (search) {
        assets = await storage.searchAssets(search as string);
      } else if (category && category !== "all") {
        assets = await storage.getAssetsByCategory(category as string);
      } else {
        assets = await storage.getAssets();
      }

      // Apply sorting
      if (sort) {
        switch (sort) {
          case "value-high":
            assets.sort((a, b) => b.estimatedValue - a.estimatedValue);
            break;
          case "value-low":
            assets.sort((a, b) => a.estimatedValue - b.estimatedValue);
            break;
          case "name":
            assets.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "date-new":
            assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "date-old":
            assets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        }
      }

      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  // Get asset by ID
  app.get("/api/assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const asset = await storage.getAsset(id);

      if (!asset) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  // Upload and analyze photo
  app.post("/api/assets/analyze", upload.single('image'), async (req: Request, res: Response) => {
    try {
      // LLM呼び出し制限チェック
      const userIdHeader = req.headers["x-user-id"];
      if (userIdHeader) {
        const userId = parseInt(userIdHeader as string, 10);
        if (!isNaN(userId)) {
          const limitResult = await checkLlmLimit(storage, userId);
          if (!limitResult.allowed) {
            res.status(429).json({ message: limitResult.reason });
            return;
          }
        }
      }

      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ message: "No image file provided" });
        return;
      }

      // Convert buffer to base64
      const imageData = file.buffer.toString('base64');
      const imageUrl = `data:${file.mimetype};base64,${imageData}`;

      // Mock AI analysis - in production, this would call an actual AI service
      const mockAnalysis = mockAnalyzeImage(imageData);

      // LLM呼び出し回数をインクリメント
      if (userIdHeader) {
        const userId = parseInt(userIdHeader as string, 10);
        if (!isNaN(userId)) {
          await storage.incrementLlmCallCount(userId);
        }
      }

      res.json({
        imageUrl,
        imageData,
        analysis: mockAnalysis
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Create asset
  app.post("/api/assets", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create asset" });
      }
    }
  });

  // Update asset
  app.put("/api/assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const validatedData = updateAssetSchema.parse(req.body);
      const asset = await storage.updateAsset(id, validatedData);

      if (!asset) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      res.json(asset);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update asset" });
      }
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const deleted = await storage.deleteAsset(id);

      if (!deleted) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Get asset statistics
  app.get("/api/assets/stats/summary", async (_req: Request, res: Response) => {
    try {
      const assets = await storage.getAssets();

      const totalItems = assets.length;
      const totalValue = assets.reduce((sum, asset) => sum + asset.estimatedValue, 0);
      const avgValue = totalItems > 0 ? Math.round(totalValue / totalItems) : 0;
      const categories = new Set(assets.map(asset => asset.category)).size;

      res.json({
        totalItems,
        totalValue,
        avgValue,
        categories
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
