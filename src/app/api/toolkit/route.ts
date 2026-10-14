import { NextRequest, NextResponse } from 'next/server';
import { loadToolkitCatalog } from '@/lib/toolkit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/toolkit — full catalog of toolkit configs (with content).
 * Optional: ?category=agents to filter.
 */
export async function GET(request: NextRequest) {
  try {
    const catalog = loadToolkitCatalog();
    const category = request.nextUrl.searchParams.get('category');

    if (category) {
      const filtered = catalog.categories.filter((c) => c.id === category);
      if (filtered.length === 0) {
        return NextResponse.json(
          { success: false, error: `Unknown category: ${category}` },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { ...catalog, categories: filtered },
      });
    }

    return NextResponse.json({ success: true, data: catalog });
  } catch (error) {
    console.error('GET /api/toolkit failed:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось загрузить каталог тулкита' },
      { status: 500 }
    );
  }
}
