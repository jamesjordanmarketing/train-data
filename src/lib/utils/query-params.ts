/**
 * Query Parameter Utilities
 * 
 * Helper functions for parsing and building URL query parameters
 * for conversation filters and pagination
 */

import { FilterConfig, PaginationConfig } from '../types/conversations';

/**
 * Parse filter configuration from URL search params
 */
export function parseFilters(
  searchParams: { [key: string]: string | string[] | undefined }
): Partial<FilterConfig> {
  const filters: Partial<FilterConfig> = {};

  // Parse status filter
  const status = searchParams.status;
  if (status) {
    filters.statuses = Array.isArray(status) ? status : status.split(',');
  }

  // Parse tier filter
  const tier = searchParams.tier;
  if (tier) {
    filters.tierTypes = Array.isArray(tier) ? tier : tier.split(',');
  }

  // Parse personas filter
  const personas = searchParams.personas;
  if (personas) {
    filters.personas = Array.isArray(personas) ? personas : personas.split(',');
  }

  // Parse emotions filter
  const emotions = searchParams.emotions;
  if (emotions) {
    filters.emotions = Array.isArray(emotions) ? emotions : emotions.split(',');
  }

  // Parse categories filter
  const categories = searchParams.categories;
  if (categories) {
    filters.categories = Array.isArray(categories) ? categories : categories.split(',');
  }

  // Parse quality range
  const qualityMin = searchParams.qualityMin;
  const qualityMax = searchParams.qualityMax;
  if (qualityMin !== undefined || qualityMax !== undefined) {
    filters.qualityRange = {
      min: qualityMin ? parseFloat(qualityMin as string) : 0,
      max: qualityMax ? parseFloat(qualityMax as string) : 10,
    };
  }

  // Parse date range
  const dateFrom = searchParams.dateFrom;
  const dateTo = searchParams.dateTo;
  if (dateFrom || dateTo) {
    filters.dateRange = {
      from: dateFrom ? (dateFrom as string) : undefined,
      to: dateTo ? (dateTo as string) : undefined,
    };
  }

  // Parse search query
  const searchQuery = searchParams.search;
  if (searchQuery && typeof searchQuery === 'string') {
    filters.searchQuery = searchQuery;
  }

  return filters;
}

/**
 * Parse pagination configuration from URL search params
 */
export function parsePagination(
  searchParams: { [key: string]: string | string[] | undefined }
): PaginationConfig {
  const page = searchParams.page;
  const limit = searchParams.limit;
  const sortBy = searchParams.sortBy;
  const sortDirection = searchParams.sortDirection;

  return {
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 25,
    sortBy: (sortBy as string) || 'created_at',
    sortDirection: (sortDirection as 'asc' | 'desc') || 'desc',
  };
}

/**
 * Build query string from filters and pagination
 */
export function buildQueryString(
  filters: Partial<FilterConfig>,
  pagination: PaginationConfig
): string {
  const params = new URLSearchParams();

  // Add filter params
  if (filters.statuses && filters.statuses.length > 0) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }

  if (filters.tierTypes && filters.tierTypes.length > 0) {
    filters.tierTypes.forEach(tier => params.append('tierTypes', tier));
  }

  if (filters.personas && filters.personas.length > 0) {
    filters.personas.forEach(persona => params.append('personas', persona));
  }

  if (filters.emotions && filters.emotions.length > 0) {
    filters.emotions.forEach(emotion => params.append('emotions', emotion));
  }

  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(category => params.append('categories', category));
  }

  if (filters.qualityRange) {
    params.set('qualityMin', filters.qualityRange.min.toString());
    params.set('qualityMax', filters.qualityRange.max.toString());
  }

  if (filters.dateRange) {
    if (filters.dateRange.from) {
      params.set('dateFrom', filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      params.set('dateTo', filters.dateRange.to);
    }
  }

  if (filters.searchQuery) {
    params.set('search', filters.searchQuery);
  }

  // Add pagination params
  params.set('page', pagination.page.toString());
  params.set('limit', pagination.limit.toString());
  params.set('sortBy', pagination.sortBy);
  params.set('sortDirection', pagination.sortDirection);

  return params.toString();
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format quality score with color badge
 */
export function getQualityColor(score?: number): string {
  if (!score) return 'gray';
  if (score >= 8) return 'green';
  if (score >= 6) return 'blue';
  if (score >= 4) return 'yellow';
  return 'red';
}

/**
 * Get status variant for badge
 */
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending_review':
    case 'generated':
      return 'secondary';
    case 'rejected':
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get tier variant for badge
 */
export function getTierVariant(tier: string): 'default' | 'secondary' | 'outline' {
  switch (tier) {
    case 'template':
      return 'default';
    case 'scenario':
      return 'secondary';
    case 'edge_case':
      return 'outline';
    default:
      return 'outline';
  }
}

