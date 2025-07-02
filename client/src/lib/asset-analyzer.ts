// Mock asset analyzer for demonstration
// In production, this would integrate with actual AI services like Google Vision, AWS Rekognition, etc.

export interface AnalysisResult {
  name: string;
  category: string;
  estimatedValue: number;
  confidence: number;
}

const mockDatabase = [
  { keywords: ['macbook', 'laptop', 'apple'], name: 'MacBook Pro', category: 'Electronics', value: 280000, confidence: 92 },
  { keywords: ['iphone', 'phone', 'mobile'], name: 'iPhone', category: 'Electronics', value: 120000, confidence: 95 },
  { keywords: ['camera', 'canon', 'nikon'], name: 'Digital Camera', category: 'Electronics', value: 45000, confidence: 88 },
  { keywords: ['watch', 'rolex', 'timepiece'], name: 'Luxury Watch', category: 'Jewelry', value: 150000, confidence: 90 },
  { keywords: ['chair', 'furniture', 'office'], name: 'Office Chair', category: 'Furniture', value: 80000, confidence: 85 },
  { keywords: ['bag', 'handbag', 'purse'], name: 'Designer Handbag', category: 'Fashion', value: 35000, confidence: 87 },
  { keywords: ['bike', 'bicycle', 'cycling'], name: 'Road Bicycle', category: 'Sports', value: 65000, confidence: 89 },
  { keywords: ['console', 'gaming', 'playstation'], name: 'Gaming Console', category: 'Electronics', value: 55000, confidence: 93 }
];

export function analyzeImage(filename: string): AnalysisResult {
  const lowercaseFilename = filename.toLowerCase();
  
  // Find matching item based on filename keywords
  const match = mockDatabase.find(item =>
    item.keywords.some(keyword => lowercaseFilename.includes(keyword))
  );

  if (match) {
    return {
      name: match.name,
      category: match.category,
      estimatedValue: match.value + Math.floor(Math.random() * 20000 - 10000), // Add variance
      confidence: Math.max(80, match.confidence + Math.floor(Math.random() * 10 - 5))
    };
  }

  // Default fallback
  const fallbackItems = mockDatabase;
  const randomItem = fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
  
  return {
    name: randomItem.name,
    category: randomItem.category,
    estimatedValue: randomItem.value + Math.floor(Math.random() * 20000 - 10000),
    confidence: Math.max(75, randomItem.confidence + Math.floor(Math.random() * 15 - 10))
  };
}
