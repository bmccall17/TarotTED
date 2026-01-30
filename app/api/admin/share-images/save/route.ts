import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/admin/share-images/save
 * Saves a generated share image to the public folder as a fallback
 * Body: { slug: string, type: 'opengraph' | 'twitter', imageData: string (base64) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, type, imageData } = body;

    if (!slug || !type || !imageData) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, type, imageData' },
        { status: 400 }
      );
    }

    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'public', 'images', 'share', type);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Decode base64 and save
    const buffer = Buffer.from(imageData, 'base64');
    const filePath = path.join(dir, `${slug}.png`);
    await writeFile(filePath, buffer);

    const publicPath = `/images/share/${type}/${slug}.png`;

    console.log(`[SHARE-IMAGE] Saved ${type} image for ${slug} to ${publicPath}`);

    return NextResponse.json({
      success: true,
      path: publicPath,
    });
  } catch (error) {
    console.error('Error saving share image:', error);
    return NextResponse.json(
      { error: 'Failed to save share image' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/share-images/save
 * Returns list of existing saved share images
 */
export async function GET() {
  try {
    const { readdir } = await import('fs/promises');
    const baseDir = path.join(process.cwd(), 'public', 'images', 'share');

    const result: { opengraph: string[]; twitter: string[] } = {
      opengraph: [],
      twitter: [],
    };

    for (const type of ['opengraph', 'twitter'] as const) {
      const dir = path.join(baseDir, type);
      if (existsSync(dir)) {
        const files = await readdir(dir);
        result[type] = files
          .filter((f) => f.endsWith('.png'))
          .map((f) => f.replace('.png', ''));
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing share images:', error);
    return NextResponse.json(
      { error: 'Failed to list share images' },
      { status: 500 }
    );
  }
}
