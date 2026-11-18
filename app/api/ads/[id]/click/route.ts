import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { recordAdClick } from "@/lib/actions/advertisement-actions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const ad = await prisma.advertisement.findUnique({ where: { id }, select: { linkUrl: true } });
  if (!ad?.linkUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await recordAdClick(id).catch(() => {});

  return NextResponse.redirect(ad.linkUrl);
}
