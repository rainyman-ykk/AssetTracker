import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Asset } from "@shared/schema";

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
}

export default function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  const [formData, setFormData] = useState({
    name: asset.name,
    category: asset.category,
    estimatedValue: asset.estimatedValue,
    purchaseDate: asset.purchaseDate || "",
    notes: asset.notes || ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAssetMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('PUT', `/api/assets/${asset.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets/stats/summary'] });
      toast({
        title: "商品が更新されました",
        description: "商品の更新が完了しました。",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "更新に失敗しました",
        description: "商品の更新に失敗しました。再度お試しください。",
        variant: "destructive",
      });
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/assets/${asset.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets/stats/summary'] });
      toast({
        title: "商品が削除されました",
        description: "商品の削除が完了しました。",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "削除に失敗しました",
        description: "商品の削除に失敗しました。再度お試しください。",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateAssetMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm("この商品を削除してもよろしいですか？この操作は取り消せません。")) {
      deleteAssetMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900">商品詳細</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">商品名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
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
                <Label htmlFor="purchaseDate">購入日</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="商品に関する備考を追加..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAssetMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>削除</span>
            </Button>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateAssetMutation.isPending}
                className="bg-material-blue hover:bg-material-blue-dark"
              >
                変更を保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
