import { Grid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import AssetCard from "./asset-card";
import type { Asset } from "@shared/schema";

interface AssetRegistryProps {
  assets: Asset[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortOption: string;
  setSortOption: (sort: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAssetClick: (asset: Asset) => void;
}

export default function AssetRegistry({
  assets,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  onAssetClick
}: AssetRegistryProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-900">登録済み商品</h2>
        <div className="flex items-center space-x-3">
          {/* Search Input (Desktop) */}
          <div className="hidden md:block">
            <Input
              type="text"
              placeholder="商品を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="すべてのカテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリ</SelectItem>
              <SelectItem value="Electronics">電子機器</SelectItem>
              <SelectItem value="Furniture">家具</SelectItem>
              <SelectItem value="Jewelry">ジュエリー</SelectItem>
              <SelectItem value="Fashion">ファッション</SelectItem>
              <SelectItem value="Sports">スポーツ</SelectItem>
              <SelectItem value="Other">その他</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value-high">価値 (高い順)</SelectItem>
              <SelectItem value="value-low">価値 (安い順)</SelectItem>
              <SelectItem value="date-new">日付 (新しい順)</SelectItem>
              <SelectItem value="date-old">日付 (古い順)</SelectItem>
              <SelectItem value="name">名前 (あいうえお順)</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-material-blue text-white" : ""}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-material-blue text-white" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mb-4">
        <Input
          type="text"
          placeholder="商品を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Assets Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">商品が見つかりません</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== "all"
              ? "検索条件やフィルターを調整してください。"
              : "最初の商品の写真をアップロードしてください。"}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={onAssetClick}
            />
          ))}
        </div>
      )}

      {/* Load More (if needed for pagination) */}
      {assets.length > 0 && assets.length % 12 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>さらに読み込む</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
