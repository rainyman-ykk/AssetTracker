import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssetSchema, updateAssetSchema } from "@shared/schema";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all assets
  app.get("/api/assets", async (req, res) => {
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
  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  // Upload and analyze photo
  app.post("/api/assets/analyze", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert buffer to base64
      const imageData = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${imageData}`;

      // Mock AI analysis - in production, this would call an actual AI service
      const mockAnalysis = mockAnalyzeImage(req.file.originalname || 'unknown');

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
  app.post("/api/assets", async (req, res) => {
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
  app.put("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateAssetSchema.parse(req.body);
      const asset = await storage.updateAsset(id, validatedData);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
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
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAsset(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Get asset statistics
  app.get("/api/assets/stats/summary", async (req, res) => {
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

// Mock AI analysis function
function mockAnalyzeImage(filename: string) {
  const mockItems = [
    { name: "MacBook Pro", category: "Electronics", value: 280000, confidence: 92 },
    { name: "iPhone", category: "Electronics", value: 120000, confidence: 95 },
    { name: "Camera", category: "Electronics", value: 45000, confidence: 88 },
    { name: "Watch", category: "Jewelry", value: 150000, confidence: 90 },
    { name: "Office Chair", category: "Furniture", value: 80000, confidence: 85 },
    { name: "Handbag", category: "Fashion", value: 35000, confidence: 87 },
    { name: "Bicycle", category: "Sports", value: 65000, confidence: 89 },
    { name: "Gaming Console", category: "Electronics", value: 55000, confidence: 93 }
  ];

  // Simple mock logic based on filename
  const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
  
  return {
    name: randomItem.name,
    category: randomItem.category,
    estimatedValue: randomItem.value + Math.floor(Math.random() * 20000 - 10000), // Add some variance
    confidence: randomItem.confidence + Math.floor(Math.random() * 10 - 5) // Add some variance
  };
}
