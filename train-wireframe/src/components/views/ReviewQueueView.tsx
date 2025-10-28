import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function ReviewQueueView() {
  const { conversations } = useAppStore();
  const reviewQueue = conversations.filter(c => c.status === 'pending_review');
  
  if (reviewQueue.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <CheckCircle className="h-24 w-24 mx-auto text-green-300 mb-6" />
          <h2 className="text-2xl mb-2">All Caught Up!</h2>
          <p className="text-gray-600">
            No conversations in the review queue right now.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Review Queue</h1>
          <p className="text-gray-600">
            {reviewQueue.length} conversation{reviewQueue.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>
      
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewQueue.map((conversation) => (
              <TableRow key={conversation.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>{conversation.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{conversation.tier}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={
                      conversation.qualityScore >= 8 ? 'text-green-600' :
                      conversation.qualityScore >= 5 ? 'text-yellow-600' :
                      'text-red-600'
                    }>
                      {conversation.qualityScore.toFixed(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Normal</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm"
                    onClick={() => toast.info('Review interface coming soon')}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {reviewQueue.length > 5 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline">
            Approve Selected ({reviewQueue.length})
          </Button>
          <Button variant="outline">
            Reject Selected
          </Button>
        </div>
      )}
    </div>
  );
}
