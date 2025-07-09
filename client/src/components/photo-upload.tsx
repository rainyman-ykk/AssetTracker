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

const getCategoryJapanese = (category: string) => {
  switch (category) {
    case "Electronics": return "電子機器";
    case "Furniture": return "家具";
    case "Jewelry": return "ジュエリー";
    case "Fashion": return "ファッション";
    case "Sports": return "スポーツ";
    case "Other": return "その他";
    default: return category;
  }
};

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
        title: "アップロードに失敗しました",
        description: "画像の解析に失敗しました。再度お試しください。",
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
        title: "資産が登録されました",
        description: "資産の登録が完了しました。",
      });
      resetForm();
      onAssetCreated();
    },
    onError: () => {
      toast({
        title: "登録に失敗しました",
        description: "資産の登録に失敗しました。再度お試しください。",
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
        title: "無効なファイルです",
        description: "画像ファイルを選択してください。",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "ファイルが大きすぎます",
        description: "10MB以下の画像を選択してください。",
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
            <h2 className="text-2xl font-medium text-gray-900">新しい商品を追加</h2>
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
                  商品の写真をアップロード
                </h3>
                <p className="text-gray-600 mb-4">
                  ドラッグ＆ドロップまたはクリックしてファイルを選択
                </p>
                <Button className="bg-material-blue hover:bg-material-blue-dark">
                  ファイルを選択
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  対応形式: JPG, PNG, HEIC (最大 10MB)
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
                      {analyzeImageMutation.isPending ? "解析中..." : "アップロード中..."}
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
                  <h3 className="text-lg font-medium text-gray-900">商品を認識しました</h3>
                </div>

                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">商品名</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">カテゴリ</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">電子機器</SelectItem>
                          <SelectItem value="Furniture">家具</SelectItem>
                          <SelectItem value="Jewelry">ジュエリー</SelectItem>
                          <SelectItem value="Fashion">ファッション</SelectItem>
                          <SelectItem value="Sports">スポーツ</SelectItem>
                          <SelectItem value="Other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">推定価値 (円)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({...formData, estimatedValue: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">購入日</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">備考</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="商品に関する備考を追加..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">認識された商品</Label>
                      <p className="text-gray-900 font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">推定価値</Label>
                      <p className="text-2xl font-bold text-material-green">
                        ¥{formData.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">カテゴリ</Label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryJapanese(formData.category)}
                      </span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">信頼度</Label>
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
                    {editMode ? "保存" : "登録"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={editMode ? () => setEditMode(false) : resetForm}
                  >
                    {editMode ? "キャンセル" : "別の商品を試す"}
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
