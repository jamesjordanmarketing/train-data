/**
 * TemplateTable Component
 * 
 * Displays a sortable table of prompt templates with actions for editing and deleting.
 */

import React from 'react';
import { Template } from '../../lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Archive, CheckCircle, TestTube2 } from 'lucide-react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TemplateTableProps {
  templates: Template[];
  sortConfig: { sortBy: string; sortOrder: string };
  onSort: (config: { sortBy: string; sortOrder: string }) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onView?: (template: Template) => void;
  onArchive?: (id: string) => void;
  onTest?: (template: Template) => void;
}

/**
 * TemplateTable - Displays templates in a sortable table format
 */
export const TemplateTable: React.FC<TemplateTableProps> = ({
  templates,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onView,
  onArchive,
  onTest,
}) => {
  const handleSort = (column: string) => {
    const newOrder =
      sortConfig.sortBy === column && sortConfig.sortOrder === 'asc'
        ? 'desc'
        : 'asc';
    onSort({ sortBy: column, sortOrder: newOrder });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.sortBy !== column) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.sortOrder === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'template':
        return 'default';
      case 'scenario':
        return 'secondary';
      case 'edge_case':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No templates found</p>
        <p className="text-sm mt-2">Create your first template to get started</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead
              onClick={() => handleSort('name')}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                Name
                <SortIcon column="name" />
              </div>
            </TableHead>
            <TableHead>
              Tier
            </TableHead>
            <TableHead>
              Description
            </TableHead>
            <TableHead
              onClick={() => handleSort('usageCount')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Usage
                <SortIcon column="usageCount" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('rating')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Rating
                <SortIcon column="rating" />
              </div>
            </TableHead>
            <TableHead className="text-center">
              Status
            </TableHead>
            <TableHead className="text-center">
              Variables
            </TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id} className="hover:bg-gray-50">
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={template.name}>
                  {template.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getTierColor(template.tier)}>
                  {template.tier || template.category}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <div className="text-sm text-gray-600 line-clamp-2" title={template.description}>
                  {template.description || 'No description'}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-mono text-sm">
                  {template.usageCount || 0}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {template.rating ? (
                    <>
                      <span className="font-mono text-sm">{template.rating.toFixed(1)}</span>
                      <span className="text-yellow-500">★</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {template.isActive !== undefined ? (
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1 inline" /> Active</>
                    ) : (
                      <><Archive className="h-3 w-3 mr-1 inline" /> Inactive</>
                    )}
                  </Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm text-gray-600">
                  {template.variables?.length || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onTest && (
                      <DropdownMenuItem onClick={() => onTest(template)}>
                        <TestTube2 className="h-4 w-4 mr-2" />
                        Test Template
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    {onArchive && template.isActive && (
                      <DropdownMenuItem onClick={() => onArchive(template.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(template.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

