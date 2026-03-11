import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const indicators = [
    { name: 'Dow Jones', symbol: '^DJI', price: 38722.69, changePercent: -0.18 },
    { name: 'Nasdaq', symbol: '^IXIC', price: 16085.11, changePercent: -1.16 },
    { name: 'Gift Nifty', symbol: '^NSEI', price: 22355.50, changePercent: -0.80 },
    { name: 'Crude Oil', symbol: 'CL=F', price: 78.01, changePercent: 0.81 }
  ];

  return NextResponse.json({ indicators });
}
