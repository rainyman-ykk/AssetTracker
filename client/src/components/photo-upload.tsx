import { useState, useRef } from "react";
import { Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploadProps {
  onAssetCreated: () => void;
}

interface AnalysisResult {
  imageUrl: string;
  imageData: string;
  analysis: {
    name: string;
    category: string;
    estimatedValue: number;
    confidence: number;
  };
}

export default function PhotoUpload({ onAssetCreated }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    estimatedValue: 0,
    purchaseDate: "",
    notes: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/assets/analyze', formData);
      return response.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setAnalysisResult(data);
      setFormData({
        name: data.analysis.name,
        category: data.analysis.category,
        estimatedValue: data.analysis.estimatedValue,
        purchaseDate: "",
        notes: ""
      });
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  const createAssetMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const response = await apiRequest('POST', '/api/assets', assetData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets/stats/summary'] });
      toast({
        title: "Asset Registered",
        description: "Your asset has been successfully registered.",
      });
      resetForm();
      onAssetCreated();
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register the asset. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setAnalysisResult(null);
    setEditMode(false);
    setFormData({
      name: "",
      category: "",
      estimatedValue: 0,
      purchaseDate: "",
      notes: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    analyzeImageMutation.mutate(file);
  };

  const handleSaveAsset = () => {
    if (!analysisResult) return;

    const assetData = {
      name: formData.name,
      category: formData.category,
      estimatedValue: formData.estimatedValue,
      confidence: analysisResult.analysis.confidence,
      imageUrl: analysisResult.imageUrl,
      imageData: analysisResult.imageData,
      purchaseDate: formData.purchaseDate || null,
      notes: formData.notes || null,
    };

    createAssetMutation.mutate(assetData);
  };

  return (
    <section className="mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900">Add New Item</h2>
            <div className="w-6 h-6 text-material-blue">
              <Upload className="w-6 h-6" />
            </div>
          </div>

          {!analysisResult ? (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? "border-material-blue bg-blue-50"
                    : "border-gray-300 hover:border-material-blue hover:bg-blue-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload a photo of your item
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag & drop or click to select a file
                </p>
                <Button className="bg-material-blue hover:bg-material-blue-dark">
                  Select File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Supported: JPG, PNG, HEIC (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Progress */}
              {(analyzeImageMutation.isPending || uploadProgress > 0) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {analyzeImageMutation.isPending ? "Analyzing..." : "Uploading..."}
                    </span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </>
          ) : (
            /* Analysis Results */
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Preview */}
              <div className="lg:w-1/3">
                <img
                  src={analysisResult.imageUrl}
                  alt="Uploaded item"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Analysis Details */}
              <div className="lg:w-2/3 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Check className="w-5 h-5 text-material-green" />
                  <h3 className="text-lg font-medium text-gray-900">Item Recognized</h3>
                </div>

                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                          <SelectItem value="Jewelry">Jewelry</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">Estimated Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({...formData, estimatedValue: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Add any notes about the item..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Recognized Item</Label>
                      <p className="text-gray-900 font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Estimated Value</Label>
                      <p className="text-2xl font-bold text-material-green">
                        ${formData.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category</Label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formData.category}
                      </span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Confidence</Label>
                      <div className="flex items-center space-x-2">
                        <Progress value={analysisResult.analysis.confidence} className="flex-grow" />
                        <span className="text-sm text-gray-600">{analysisResult.analysis.confidence}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={editMode ? handleSaveAsset : () => setEditMode(true)}
                    className="bg-material-blue hover:bg-material-blue-dark"
                    disabled={createAssetMutation.isPending}
                  >
                    {editMode ? "Save Asset" : "Register"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={editMode ? () => setEditMode(false) : resetForm}
                  >
                    {editMode ? "Cancel" : "Try Another"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
