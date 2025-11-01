import { differenceInDays } from 'date-fns';
import { Badge } from '../ui/badge';
import { Conversation } from '../../lib/types';
import { cn } from '../../lib/utils';

interface QualityScoreBadgeProps {
  score?: number;
  className?: string;
}

export function QualityScoreBadge({ score, className }: QualityScoreBadgeProps) {
  if (!score || score === 0) {
    return <span className="text-muted-foreground text-sm">N/A</span>;
  }
  
  const getColorClass = () => {
    if (score >= 8) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };
  
  return (
    <Badge className={cn(getColorClass(), className)}>
      {score.toFixed(1)}
    </Badge>
  );
}

interface PriorityBadgeProps {
  conversation: Conversation;
  className?: string;
}

export function PriorityBadge({ conversation, className }: PriorityBadgeProps) {
  const daysOld = differenceInDays(new Date(), new Date(conversation.createdAt));
  const score = conversation.qualityScore || 5;
  
  // Determine priority based on quality score and age
  const priority = score < 5 || daysOld > 7 ? 'high' :
                   (score >= 5 && score < 7) || (daysOld >= 3 && daysOld <= 7) ? 'medium' : 
                   'low';
  
  const label = priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low';
  const variant = priority === 'high' ? 'destructive' : priority === 'medium' ? 'secondary' : 'outline';
  
  const getColorClass = () => {
    if (priority === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };
  
  return (
    <Badge className={cn(getColorClass(), className)}>
      {label}
    </Badge>
  );
}

