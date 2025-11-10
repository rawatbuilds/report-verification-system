// src/types.ts
export interface ComparisonError {
  type: string;
  message: string;
  expected?: string;
  actual?: string;
  position?: number;
  actualPosition?: number;
}

export interface ComparisonSummary {
  totalColumns: number;
  matchingColumns: number;
  missingColumns: number;
  extraColumns: number;
  sequenceErrors: number;
}

export interface ComparisonResult {
  isValid: boolean;
  summary: ComparisonSummary;
  errors: ComparisonError[];
}
