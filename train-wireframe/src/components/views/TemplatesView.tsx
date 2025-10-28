import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export function TemplatesView() {
  const { templates, showConfirm, updateTemplate } = useAppStore();
  
  const handleDelete = (id: string, name: string) => {
    showConfirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        toast.success('Template deleted successfully');
      },
    });
  };
  
  const handleEdit = (id: string) => {
    toast.info('Edit functionality coming soon');
  };
  
  const handleView = (id: string) => {
    toast.info('View details coming soon');
  };
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Scenario Prompts</h1>
          <p className="text-gray-600">
            Reusable prompt templates for generating training conversations
          </p>
        </div>
        <Button onClick={() => toast.info('Template creation coming soon')}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{template.usageCount} uses</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(template.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(template.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template.id, template.name)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <h3 className="mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline">{template.category}</Badge>
              <div className="flex items-center gap-1 text-yellow-500">
                {'★'.repeat(Math.floor(template.rating))}
                {'☆'.repeat(5 - Math.floor(template.rating))}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-gray-500">
                Variables: {template.variables.map(v => v.name).join(', ')}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
