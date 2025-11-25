'use client';

import { useState, useEffect } from 'react';
import type { 
  Persona, 
  EmotionalArc, 
  TrainingTopic 
} from '@/lib/types/bulk-generator.types';

interface ScaffoldingData {
  personas: Persona[];
  coreArcs: EmotionalArc[];
  edgeArcs: EmotionalArc[];
  topics: TrainingTopic[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch scaffolding data (personas, emotional arcs, topics)
 * Separates emotional arcs into core and edge categories
 */
export function useScaffoldingData(): ScaffoldingData {
  const [data, setData] = useState<ScaffoldingData>({
    personas: [],
    coreArcs: [],
    edgeArcs: [],
    topics: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch from existing API endpoints
        const [personasRes, arcsRes, topicsRes] = await Promise.all([
          fetch('/api/scaffolding/personas'),
          fetch('/api/scaffolding/emotional-arcs'),
          fetch('/api/scaffolding/training-topics')
        ]);

        // Check responses
        if (!personasRes.ok) {
          throw new Error(`Failed to fetch personas: ${personasRes.status}`);
        }
        if (!arcsRes.ok) {
          throw new Error(`Failed to fetch emotional arcs: ${arcsRes.status}`);
        }
        if (!topicsRes.ok) {
          throw new Error(`Failed to fetch training topics: ${topicsRes.status}`);
        }

        const [personasData, arcsData, topicsData] = await Promise.all([
          personasRes.json(),
          arcsRes.json(),
          topicsRes.json()
        ]);

        // Extract data from API response format
        const personas: Persona[] = (personasData.personas || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          persona_key: p.persona_key,
          archetype: p.archetype,
          is_active: p.is_active
        }));

        const allArcs: EmotionalArc[] = (arcsData.emotional_arcs || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          arc_key: a.arc_key,
          conversation_category: a.conversation_category || 'core',
          tier: a.tier,
          arc_strategy: a.arc_strategy,
          is_active: a.is_active
        }));

        const topics: TrainingTopic[] = (topicsData.training_topics || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          topic_key: t.topic_key,
          category: t.category,
          complexity_level: t.complexity_level,
          is_active: t.is_active
        }));

        // Separate core and edge arcs
        const coreArcs = allArcs.filter(a => a.conversation_category === 'core');
        const edgeArcs = allArcs.filter(a => a.conversation_category === 'edge');

        setData({
          personas,
          coreArcs,
          edgeArcs,
          topics,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Failed to load scaffolding data:', err);
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load scaffolding data'
        }));
      }
    }

    fetchData();
  }, []);

  return data;
}

