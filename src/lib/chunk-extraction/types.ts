export type ExtractionCandidate = {
  type: 'Chapter_Sequential' | 'Instructional_Unit' | 'CER' | 'Example_Scenario';
  confidence: number;  // 0-1
  startIndex: number;
  endIndex: number;
  sectionHeading?: string;
  reasoning: string;  // Why this was identified as this chunk type
};

export type DocumentStructure = {
  totalChars: number;
  totalTokens: number;
  pageCount?: number;
  sections: Section[];
};

export type Section = {
  heading: string;
  level: number;  // 1=H1, 2=H2, etc.
  startIndex: number;
  endIndex: number;
  pageStart?: number;
  pageEnd?: number;
};

