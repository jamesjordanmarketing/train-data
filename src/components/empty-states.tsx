'use client';

import { Button } from '@/components/ui/button';
import { FileText, Search, AlertCircle, Inbox, MessageSquare, Filter } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoConversationsEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-16 w-16" />}
      title="No conversations yet"
      description="Get started by generating your first batch of training conversations. You can create conversations from templates, scenarios, or edge cases."
      action={onCreate ? {
        label: 'Generate Conversations',
        onClick: onCreate
      } : undefined}
    />
  );
}

export function NoSearchResultsEmpty({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-16 w-16" />}
      title="No conversations found"
      description="No conversations match your current filters. Try adjusting your search criteria or clearing all filters."
      action={{
        label: 'Clear Filters',
        onClick: onClear
      }}
    />
  );
}

export function ErrorStateEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-destructive" />}
      title="Failed to load conversations"
      description="There was an error loading your conversations. This might be due to a network issue or a temporary problem with the server."
      action={{
        label: 'Try Again',
        onClick: onRetry
      }}
    />
  );
}

export function EmptyTable() {
  return (
    <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
      <div className="text-center text-muted-foreground">
        <Inbox className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No data to display</p>
      </div>
    </div>
  );
}

export function NoSelectionEmpty() {
  return (
    <EmptyState
      icon={<Filter className="h-12 w-12" />}
      title="No conversations selected"
      description="Select one or more conversations from the table to perform bulk actions."
    />
  );
}

export function LoadingFailedEmpty({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-destructive" />}
      title="Loading failed"
      description={message || "We couldn't load this content. Please try again or contact support if the problem persists."}
      action={{
        label: 'Retry',
        onClick: onRetry
      }}
    />
  );
}

