import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const creatureId = parseInt(id);

    if (isNaN(creatureId)) {
      return NextResponse.json(
        { error: "Invalid creature ID" },
        { status: 400 }
      );
    }

    // Fetch creature data
    const creature = await prisma.creature.findUnique({
      where: { id: creatureId },
      include: { user: true },
    });

    if (!creature) {
      return NextResponse.json(
        { error: "Creature not found" },
        { status: 404 }
      );
    }

    // Generate ERC-721 compliant metadata
    const metadata = {
      name: `Trainer: ${
        creature.user.resolvedName ||
        creature.user.walletAddress.slice(0, 6) +
          "..." +
          creature.user.walletAddress.slice(-4)
      }`,
      description: `${creature.rarity} ${creature.type}-type ${creature.role}: ${creature.name}. ${creature.flavorText}`,
      image: creature.imageUrl,
      external_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/profile/${creature.user.walletAddress}`,
      attributes: [
        {
          trait_type: "Rarity",
          value: creature.rarity,
        },
        {
          trait_type: "Type",
          value: creature.type,
        },
        {
          trait_type: "Role",
          value: creature.role,
        },
        {
          trait_type: "Attack",
          value: creature.attack,
          display_type: "number",
        },
        {
          trait_type: "Defense",
          value: creature.defense,
          display_type: "number",
        },
        {
          trait_type: "Speed",
          value: creature.speed,
          display_type: "number",
        },
        {
          trait_type: "Wisdom",
          value: creature.wisdom,
          display_type: "number",
        },
        {
          trait_type: "Luck",
          value: creature.luck,
          display_type: "number",
        },
        {
          trait_type: "Power Score",
          value: creature.user.powerScore,
          display_type: "number",
        },
        {
          trait_type: "Chain",
          value: creature.user.chain,
        },
      ],
    };

    return NextResponse.json(metadata, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
