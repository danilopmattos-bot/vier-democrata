export function GET() {
  return Response.json({
    status: 'ok',
    brand: 'Democrata Bier',
    platform: 'vercel',
    timestamp: new Date().toISOString(),
  });
}
