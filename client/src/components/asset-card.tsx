import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Asset } from "@shared/schema";

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
}

export default function AssetCard({ asset, onClick }: AssetCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "electronics":
        return "bg-blue-100 text-blue-800";
      case "furniture":
        return "bg-green-100 text-green-800";
      case "jewelry":
        return "bg-purple-100 text-purple-800";
      case "fashion":
        return "bg-pink-100 text-pink-800";
      case "sports":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(asset)}
    >
      <div className="aspect-w-4 aspect-h-3 bg-gray-100">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
            {asset.name}
          </h3>
          <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-2xl font-bold text-material-green mb-2">
          ¥{asset.estimatedValue.toLocaleString()}
        </p>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(asset.category)}`}>
            {getCategoryJapanese(asset.category)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(asset.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
