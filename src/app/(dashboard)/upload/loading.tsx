import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

/**
 * Upload Page Loading State
 * 
 * Displays loading skeletons while the upload page initializes
 */
export default function UploadLoading() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Upload Zone Skeleton */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="space-y-4 items-center flex flex-col">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats Skeleton */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

