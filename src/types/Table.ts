// types.ts
export type ColumnType = 'text' | 'image' | 'progress' | 'percentage';

export interface SubColumn {
  key: string;
  prefix?: string;
}

export interface Column {
  key: string;
  label: string;
  type?: ColumnType;
  subColumns?: SubColumn[];
}

export interface TableProps<T> {
  columns: Column[];
  data: T[];
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}
