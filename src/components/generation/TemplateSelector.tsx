'use client';

import { Template } from '@/types/templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Check } from 'lucide-react';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  loading?: boolean;
}

export function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  loading = false
}: TemplateSelectorProps) {
  // Loading state: Show 3 skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground text-lg">No templates available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Templates will appear here once they are added to the system
        </p>
      </div>
    );
  }

  // Render template cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => {
        const isSelected = template.id === selectedTemplateId;

        return (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg flex-1">{template.template_name}</CardTitle>
                {isSelected && (
                  <div className="text-primary font-bold bg-primary/10 rounded-full p-1">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {template.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Tier and Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="capitalize"
                  >
                    {template.tier.replace('_', ' ')}
                  </Badge>
                  {template.is_active && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      Active
                    </Badge>
                  )}
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  )}
                </div>

                {/* Rating and Usage Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{template.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs">
                    Used <span className="font-medium">{template.usage_count}</span> times
                  </span>
                </div>

                {/* Success Rate */}
                {template.success_rate > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Success Rate: <span className="font-medium text-green-600">
                      {(template.success_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

