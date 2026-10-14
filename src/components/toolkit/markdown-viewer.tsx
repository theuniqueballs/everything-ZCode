'use client';

import React, { Children, isValidElement, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import graphql from 'react-syntax-highlighter/dist/cjs/languages/prism/graphql';
import diff from 'react-syntax-highlighter/dist/cjs/languages/prism/diff';
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/cjs/styles/prism/one-light';
import { cn } from '@/lib/utils';
import { slugifyHeading } from '@/lib/toc';
import { CopyCodeButton } from './copy-code-button';

/** Flatten React children to plain text (for heading slugs). */
function childrenText(children: React.ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenText).join('');
  if (isValidElement(children)) {
    return childrenText((children.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/* Register Prism languages once (PrismLight keeps the bundle small). */
const REGISTERED = new Set<string>();
function register(name: string, lang: unknown) {
  if (!REGISTERED.has(name)) {
    SyntaxHighlighter.registerLanguage(name, lang);
    REGISTERED.add(name);
  }
}
register('bash', bash);
register('json', json);
register('javascript', javascript);
register('typescript', typescript);
register('tsx', tsx);
register('markdown', markdown);
register('yaml', yaml);
register('graphql', graphql);
register('diff', diff);

/** Fence language → registered Prism language. */
const LANG_ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  terminal: 'bash',
  js: 'javascript',
  ts: 'typescript',
  md: 'markdown',
  yml: 'yaml',
  prisma: 'graphql',
  text: 'bash',
  txt: 'bash',
};

function extractCodeText(node: React.ReactNode): { text: string; lang: string | null } {
  if (!isValidElement(node)) return { text: '', lang: null };
  const props = node.props as { className?: string; children?: React.ReactNode };
  const langMatch = /language-([\w-]+)/.exec(props.className ?? '');
  const raw = props.children;
  const text = (
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('') : ''
  ).replace(/\n$/, '');
  return { text, lang: langMatch ? langMatch[1] : null };
}

/**
 * Markdown renderer tuned for toolkit config files:
 * Prism syntax highlighting, copyable code blocks, GFM tables — themed for dark/light.
 */
export function MarkdownViewer({ content, className }: { content: string; className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const prismStyle = isDark ? oneDark : oneLight;

  const components = useMemo(
    () => ({
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mt-8 mb-4 border-b border-border pb-2 text-xl font-bold tracking-tight first:mt-0">
          {children}
        </h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2
          id={slugifyHeading(childrenText(children))}
          className="mt-7 mb-3 scroll-mt-4 text-lg font-semibold tracking-tight"
        >
          {children}
        </h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3
          id={slugifyHeading(childrenText(children))}
          className="mt-5 mb-2 scroll-mt-4 text-base font-semibold"
        >
          {children}
        </h3>
      ),
      h4: ({ children }: { children?: React.ReactNode }) => (
        <h4 className="mt-4 mb-2 text-sm font-semibold text-muted-foreground">{children}</h4>
      ),
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="my-3 text-foreground/90">{children}</p>
      ),
      a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          {children}
        </a>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-primary/70">{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-primary/70">{children}</ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="pl-1 text-foreground/90">{children}</li>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="my-4 border-l-2 border-primary/60 bg-primary/5 py-2 pl-4 pr-3 text-muted-foreground italic">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-border" />,
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),
      code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
        const isBlock = /language-/.test(className ?? '') || String(children).includes('\n');
        if (isBlock) {
          return (
            <code className={cn('font-mono text-xs leading-relaxed', className)}>{children}</code>
          );
        }
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-primary">
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => {
        const { text, lang } = extractCodeText(Children.toArray(children)[0]);
        if (lang) {
          const prismLang = LANG_ALIASES[lang] ?? lang;
          if (REGISTERED.has(prismLang)) {
            return (
              <div className="group/code relative my-4 overflow-hidden rounded-lg border border-border">
                <CopyCodeButton text={text} />
                <SyntaxHighlighter
                  language={prismLang}
                  style={prismStyle}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    paddingTop: '1rem',
                    background: 'transparent',
                    fontSize: '12px',
                    lineHeight: 1.7,
                  }}
                  codeTagProps={{
                    style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' },
                  }}
                  className="overflow-x-auto scrollbar-thin [&>pre]:!bg-transparent"
                >
                  {text}
                </SyntaxHighlighter>
              </div>
            );
          }
        }
        return (
          <div className="group/code relative my-4">
            <CopyCodeButton text={text} />
            <pre className="overflow-x-auto rounded-lg border border-border bg-zinc-950 p-4 pr-10 text-zinc-100 dark:bg-black/60 scrollbar-thin">
              {children}
            </pre>
          </div>
        );
      },
      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="my-4 overflow-x-auto rounded-lg border border-border scrollbar-thin">
          <table className="w-full border-collapse text-xs">{children}</table>
        </div>
      ),
      thead: ({ children }: { children?: React.ReactNode }) => (
        <thead className="bg-muted/60">{children}</thead>
      ),
      th: ({ children }: { children?: React.ReactNode }) => (
        <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>
      ),
      td: ({ children }: { children?: React.ReactNode }) => (
        <td className="border-b border-border/60 px-3 py-2 align-top text-foreground/85">
          {children}
        </td>
      ),
    }),
    [prismStyle]
  );

  return (
    <div className={cn('md-body text-sm leading-relaxed', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
