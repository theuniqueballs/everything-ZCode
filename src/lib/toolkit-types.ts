export type ToolkitCategoryId =
  | 'agents'
  | 'commands'
  | 'skills'
  | 'rules'
  | 'hooks'
  | 'contexts'
  | 'settings';

export interface ToolkitItem {
  /** e.g. "agents/code-reviewer.md" */
  path: string;
  category: ToolkitCategoryId;
  /** Display name, e.g. "code-reviewer" or "tdd" */
  name: string;
  title: string;
  description: string;
  /** Parsed frontmatter key-values (name, description, tools, model...) */
  meta: Record<string, string>;
  /** File size in bytes */
  size: number;
  /** Line count */
  lines: number;
  /** Full markdown content including frontmatter */
  content: string;
}

export interface ToolkitCategory {
  id: ToolkitCategoryId;
  label: string;
  labelEn: string;
  description: string;
  icon: string;
  items: ToolkitItem[];
}

export interface ToolkitCatalog {
  categories: ToolkitCategory[];
  totalItems: number;
  totalFiles: number;
  generatedAt: string;
}

export interface ToolkitApiResponse {
  success: boolean;
  data?: ToolkitCatalog;
  error?: string;
}
