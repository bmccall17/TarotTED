import { NextRequest, NextResponse } from 'next/server';
import { deleteMapping, setMappingAsPrimary } from '@/lib/db/queries/admin-mappings';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/mappings/[id]
 * Delete a mapping
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      );
    }

    await deleteMapping(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete mapping' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/mappings/[id]
 * Update a mapping (e.g., set as primary)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      );
    }

    // If setting as primary
    if (body.setAsPrimary === true) {
      const mapping = await setMappingAsPrimary(id);
      return NextResponse.json({ mapping });
    }

    return NextResponse.json(
      { error: 'No valid action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating mapping:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update mapping' },
      { status: 500 }
    );
  }
}
