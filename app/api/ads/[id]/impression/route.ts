import { NextResponse } from "next/server";
import { recordAdImpression } from "@/lib/actions/advertisement-actions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  await recordAdImpression(id).catch(() => {});
  return NextResponse.json({ success: true });
}
