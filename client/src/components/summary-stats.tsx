import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface StatsData {
  totalItems: number;
  totalValue: number;
  avgValue: number;
  categories: number;
}

export default function SummaryStats() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/assets/stats/summary'],
  });

  if (isLoading) {
    return (
      <section className="mt-12">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="mt-12">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Asset Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-material-blue mb-1">
                {stats.totalItems}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-material-green mb-1">
                ${stats.totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-material-orange mb-1">
                ${stats.avgValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Average Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-material-teal mb-1">
                {stats.categories}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
