// Type shim for react-syntax-highlighter (no bundled types).
import type { CSSProperties, ComponentType, HTMLAttributes, ReactNode } from 'react';

type PrismStyle = Record<string, CSSProperties>;

interface PrismProps {
  language?: string;
  style?: PrismStyle;
  children?: ReactNode;
  customStyle?: CSSProperties;
  codeTagProps?: HTMLAttributes<HTMLElement>;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  wrapLongLines?: boolean;
  PreTag?: string | ComponentType<Record<string, unknown>>;
  CodeTag?: string | ComponentType<Record<string, unknown>>;
  className?: string;
}

declare module 'react-syntax-highlighter' {
  export const PrismLight: ComponentType<PrismProps>;
  export const Prism: ComponentType<PrismProps>;
  export const Light: ComponentType<PrismProps>;
  export function registerLanguage(name: string, func: unknown): void;
}

declare module 'react-syntax-highlighter/dist/cjs/languages/prism/*' {
  const _default: unknown;
  export default _default;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism/*' {
  const _default: PrismStyle;
  export default _default;
}

export {};
