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
        title: "Asset Updated",
        description: "Your asset has been successfully updated.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the asset. Please try again.",
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
        title: "Asset Deleted",
        description: "Your asset has been successfully deleted.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the asset. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateAssetMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      deleteAssetMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900">Asset Details</h2>
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
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
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
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any notes about the item..."
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
              <span>Delete</span>
            </Button>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateAssetMutation.isPending}
                className="bg-material-blue hover:bg-material-blue-dark"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
