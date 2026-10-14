import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { loadToolkitCatalog } from '@/lib/toolkit';
import type { ToolkitItem } from '@/lib/toolkit-types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/og — dynamic Open Graph card (1200×630).
 *
 * ?item=<toolkit path>  → per-config card (name, category, description, lines)
 * (no params)           → site-level card with live toolkit stats
 *
 * The item is resolved server-side from the toolkit catalog, so query
 * strings never reach the canvas as untrusted text.
 */
export async function GET(request: NextRequest) {
  const itemPath = request.nextUrl.searchParams.get('item');

  let item: ToolkitItem | null = null;
  let totalItems = 45;
  try {
    const catalog = loadToolkitCatalog();
    totalItems = catalog.totalItems;
    if (itemPath) {
      item =
        catalog.categories
          .flatMap((c) => c.items)
          .find((i) => i.path === decodeURIComponent(itemPath)) ?? null;
    }
  } catch {
    // fall through to site-level card
  }

  const CATEGORY_LABEL: Record<string, string> = {
    agents: 'Agent',
    commands: 'Command',
    skills: 'Skill',
    rules: 'Rule',
    hooks: 'Hook',
    contexts: 'Context',
    settings: 'Settings',
  };

  if (item) {
    const description =
      item.description.length > 150
        ? `${item.description.slice(0, 147).trimEnd()}…`
        : item.description;
    return new ImageResponse(
      ogItemCard({
        name: item.name,
        category: CATEGORY_LABEL[item.category] ?? 'Config',
        lines: item.lines,
        description,
        path: item.path,
      }),
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    ogSiteCard({ totalItems }),
    { width: 1200, height: 630 },
  );
}

/* ---- satori-compatible flex layouts (no CSS grid) ---- */

const FRAME: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: 64,
  backgroundColor: '#09090b',
  backgroundImage:
    'radial-gradient(circle at 85% 10%, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 45%)',
  color: '#fafafa',
  fontFamily: 'sans-serif',
};

function ogItemCard(item: {
  name: string;
  category: string;
  lines: number;
  description: string;
  path: string;
}) {
  return (
    <div style={FRAME}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 700,
            color: '#34d399',
          }}
        >
          Z
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#34d399' }}>
            Everything ZCode
          </span>
          <span style={{ fontSize: 20, color: '#a1a1aa' }}>
            production-ready configs for Z.ai Code
          </span>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            padding: '8px 20px',
            borderRadius: 999,
            border: '1px solid rgba(16,185,129,0.5)',
            backgroundColor: 'rgba(16,185,129,0.12)',
            fontSize: 22,
            color: '#34d399',
          }}
        >
          {item.category}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontFamily: 'monospace',
            color: '#fafafa',
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            color: '#d4d4d8',
            maxWidth: 980,
          }}
        >
          {item.description}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 22,
          color: '#71717a',
        }}
      >
        <span style={{ fontFamily: 'monospace' }}>toolkit/{item.path}</span>
        <span>{item.lines} lines · MIT</span>
      </div>
    </div>
  );
}

function ogSiteCard({ totalItems }: { totalItems: number }) {
  return (
    <div style={FRAME}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 700,
            color: '#34d399',
          }}
        >
          Z
        </div>
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#34d399' }}>
          Everything ZCode
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: '-0.02em' }}>
          The complete config
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: '-0.02em', color: '#34d399' }}>
          toolkit for Z.ai Code
        </div>
        <div style={{ fontSize: 28, color: '#a1a1aa' }}>
          Agents · Commands · Skills · Rules · Hooks · Contexts — battle-tested with GLM models
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 22, color: '#71717a' }}>
        {totalItems} files · 7 categories · MIT license · everything-zcode
      </div>
    </div>
  );
}
