'use client';

import { useState, useEffect } from 'react';
import { Template } from '@/types/templates';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const response = await fetch('/api/templates');

        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const result = await response.json();
        // API returns { data: [...], pagination: {...} }
        // Handle both formats for backwards compatibility
        setTemplates(result.data || result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  return { templates, loading, error };
}

