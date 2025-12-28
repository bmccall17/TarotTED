import { NextRequest, NextResponse } from 'next/server';
import { getAllCardsForAdmin } from '@/lib/db/queries/admin-cards';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;

    const cards = await getAllCardsForAdmin(search);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error fetching admin cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
