import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppStore } from '../../stores/useAppStore';

export function ReviewQueueEmptyState() {
  const { setCurrentView } = useAppStore();
  
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2 text-gray-900">All Caught Up!</h2>
      <p className="text-muted-foreground mb-2 text-center">
        There are no conversations pending review at this time.
      </p>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        New conversations will appear here when generation completes and they're ready for review.
      </p>
      <Button variant="outline" onClick={handleBackToDashboard}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>
  );
}

