import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { creatureId, tokenId } = await req.json();

    if (!creatureId || tokenId === undefined) {
      return NextResponse.json(
        { error: "Creature ID and token ID are required" },
        { status: 400 }
      );
    }

    // Update creature with on-chain token ID
    const updatedCreature = await prisma.creature.update({
      where: { id: creatureId },
      data: {
        onChainTokenId: tokenId.toString(),
        mintedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Token ID updated successfully",
      creature: updatedCreature,
    });
  } catch (error: any) {
    console.error("Error updating token ID:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update token ID" },
      { status: 500 }
    );
  }
}
