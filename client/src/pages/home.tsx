import { useState } from "react";
import { Search, Filter, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhotoUpload from "@/components/photo-upload";
import AssetRegistry from "@/components/asset-registry";
import SummaryStats from "@/components/summary-stats";
import AssetDetailModal from "@/components/asset-detail-modal";
import { useAssets } from "@/hooks/use-assets";
import type { Asset } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("date-new");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showUploadSection, setShowUploadSection] = useState(true);

  const { data: assets, isLoading } = useAssets({
    search: searchQuery,
    category: selectedCategory,
    sort: sortOption
  });

  const handleAssetCreated = () => {
    setShowUploadSection(false);
    // The query will automatically refetch due to cache invalidation
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleCloseModal = () => {
    setSelectedAsset(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-material-blue text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-medium">AssetTracker</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="md:hidden text-white">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Photo Upload Section */}
        {showUploadSection && (
          <PhotoUpload onAssetCreated={handleAssetCreated} />
        )}

        {/* Asset Registry */}
        <AssetRegistry
          assets={assets || []}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOption={sortOption}
          setSortOption={setSortOption}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAssetClick={handleAssetClick}
        />

        {/* Summary Stats */}
        <SummaryStats />
      </main>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={handleCloseModal}
        />
      )}

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg md:hidden bg-material-blue hover:bg-material-blue-dark"
        onClick={() => setShowUploadSection(true)}
      >
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
          <div className="w-3 h-0.5 bg-material-blue"></div>
          <div className="w-0.5 h-3 bg-material-blue absolute"></div>
        </div>
      </Button>
    </div>
  );
}
