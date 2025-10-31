import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Users, Filter, CheckCircle, Database } from 'lucide-react';

export type ExportScope = 'selected' | 'filtered' | 'approved' | 'all';

interface ExportScopeSelectorProps {
  value: ExportScope;
  onChange: (value: ExportScope) => void;
  counts: {
    selected: number;
    filtered: number;
    approved: number;
    all: number;
  };
}

export function ExportScopeSelector({ value, onChange, counts }: ExportScopeSelectorProps) {
  const scopeOptions = [
    {
      id: 'selected',
      value: 'selected' as ExportScope,
      icon: Users,
      label: 'Selected Conversations',
      description: 'Export only conversations you have selected',
      count: counts.selected,
      disabled: counts.selected === 0,
    },
    {
      id: 'filtered',
      value: 'filtered' as ExportScope,
      icon: Filter,
      label: 'Current Filters',
      description: 'Export conversations matching active filters',
      count: counts.filtered,
      disabled: false,
    },
    {
      id: 'approved',
      value: 'approved' as ExportScope,
      icon: CheckCircle,
      label: 'All Approved',
      description: 'Export all approved conversations',
      count: counts.approved,
      disabled: counts.approved === 0,
    },
    {
      id: 'all',
      value: 'all' as ExportScope,
      icon: Database,
      label: 'All Data',
      description: 'Export entire dataset',
      count: counts.all,
      disabled: counts.all === 0,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Export Scope</Label>
        <span className="text-xs text-muted-foreground">
          Select which conversations to export
        </span>
      </div>
      
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="space-y-2"
      >
        {scopeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className={`
                relative flex items-start space-x-3 rounded-lg border p-4 
                transition-all duration-200
                ${value === option.value 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border bg-background hover:border-muted-foreground/50'
                }
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <RadioGroupItem
                value={option.value}
                id={option.id}
                disabled={option.disabled}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={option.id}
                  className={`
                    flex items-center gap-2 text-sm font-medium cursor-pointer
                    ${option.disabled ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {option.label}
                  <Badge 
                    variant={value === option.value ? 'default' : 'secondary'}
                    className="ml-auto"
                  >
                    {option.count.toLocaleString()}
                  </Badge>
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

