/**
 * TemplatesView Component
 * 
 * Main view for managing prompt templates with CRUD operations.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Filter, RefreshCw, BarChart3, TestTube2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Template, TierType } from '../../lib/types';
import { TemplateTable } from '../templates/TemplateTable';
import { TemplateEditorModal } from '../templates/TemplateEditorModal';
import { TemplateTestModal } from '../templates/TemplateTestModal';
import { TemplateAnalyticsDashboard } from '../templates/TemplateAnalyticsDashboard';
import { TemplateDetailModal } from '../templates/TemplateDetailModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [templateToTest, setTemplateToTest] = useState<Template | null>(null);
  const [templateToView, setTemplateToView] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState({ 
    sortBy: 'name', 
    sortOrder: 'asc' 
  });
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Fetch templates on mount and when filters change
  useEffect(() => {
    fetchTemplates();
  }, [sortConfig, filterTier, filterActive]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      if (filterTier !== 'all') {
        params.append('tier', filterTier);
      }

      if (filterActive !== 'all') {
        params.append('isActive', filterActive);
      }

      const response = await fetch(`/api/templates?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error instanceof Error ? error.message : 'Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    const confirmMessage = template
      ? `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
      : 'Are you sure you want to delete this template?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.canArchive) {
          // Template has dependencies, suggest archiving
          const shouldArchive = confirm(
            `${data.error}\n\nWould you like to archive this template instead?`
          );
          if (shouldArchive) {
            await handleArchiveTemplate(id);
          }
          return;
        }
        throw new Error(data.error || 'Failed to delete template');
      }

      toast.success('Template deleted successfully');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete template');
    }
  };

  const handleArchiveTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive template');
      }

      toast.success('Template archived successfully');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error archiving template:', error);
      toast.error('Failed to archive template');
    }
  };

  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    try {
      const isUpdate = !!templateData.id;
      const url = isUpdate
        ? `/api/templates/${templateData.id}`
        : '/api/templates';
      
      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template');
      }

      toast.success(isUpdate ? 'Template updated successfully' : 'Template created successfully');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error saving template:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handleTestTemplate = (template: Template) => {
    setTemplateToTest(template);
    setIsTestModalOpen(true);
  };

  const handleViewTemplate = (template: Template) => {
    setTemplateToView(template);
    setIsDetailModalOpen(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    // Open editor with duplicated template (without ID)
    const duplicatedTemplate = {
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      rating: 0,
    };
    setSelectedTemplate(duplicatedTemplate as any);
    setIsEditorOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleOpenAnalytics = () => {
    setIsAnalyticsDashboardOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prompt Templates</h1>
          <p className="text-gray-600">
            Create and manage reusable templates for generating training conversations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="tier-filter" className="text-sm text-gray-600">
              Tier:
            </label>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger id="tier-filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="scenario">Scenario</SelectItem>
                <SelectItem value="edge_case">Edge Case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="active-filter" className="text-sm text-gray-600">
              Status:
            </label>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger id="active-filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTemplates}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading templates...</p>
          </div>
        </div>
      ) : (
        <TemplateTable
          templates={templates}
          sortConfig={sortConfig}
          onSort={setSortConfig}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onArchive={handleArchiveTemplate}
          onTest={handleTestTemplate}
          onView={handleViewTemplate}
        />
      )}

      <TemplateEditorModal
        template={selectedTemplate}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTemplate}
      />

      {templateToTest && (
        <TemplateTestModal
          template={templateToTest}
          isOpen={isTestModalOpen}
          onClose={() => {
            setIsTestModalOpen(false);
            setTemplateToTest(null);
          }}
        />
      )}

      <TemplateDetailModal
        template={templateToView}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setTemplateToView(null);
        }}
        onEdit={(template) => {
          setSelectedTemplate(template);
          setIsEditorOpen(true);
          setIsDetailModalOpen(false);
        }}
        onDuplicate={handleDuplicateTemplate}
        onDelete={handleDeleteTemplate}
      />

      {isAnalyticsDashboardOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <TemplateAnalyticsDashboard
            onClose={() => setIsAnalyticsDashboardOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
