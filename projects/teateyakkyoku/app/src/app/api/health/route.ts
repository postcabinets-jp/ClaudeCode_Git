export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    openai: !!process.env.OPENAI_API_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
