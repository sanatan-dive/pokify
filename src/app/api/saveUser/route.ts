import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const bodyText = await request.text();
    console.log("SaveUser Body:", bodyText);
    
    if (!bodyText) {
      return new NextResponse("Empty request body", { status: 400 });
    }

    const {
      walletAddress,
      chain,
      resolvedName,
      nativeBalanceUSD,
      tokenValueUSD,
      nftCount,
      txCount,
      powerScore,
      creature
    } = JSON.parse(bodyText);

    if (!walletAddress || powerScore === undefined || !creature) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const lowerAddress = walletAddress.toLowerCase();

    // Upsert user
    const user = await prisma.user.upsert({
      where: { walletAddress: lowerAddress },
      update: {
        chain,
        resolvedName,
        nativeBalanceUSD,
        tokenValueUSD,
        nftCount,
        txCount,
        powerScore,
      },
      create: {
        walletAddress: lowerAddress,
        chain,
        resolvedName,
        nativeBalanceUSD,
        tokenValueUSD,
        nftCount,
        txCount,
        powerScore,
      },
    });

    // Create creature
    const savedCreature = await prisma.creature.create({
      data: {
        userId: user.id,
        name: creature.name,
        type: creature.type,
        role: creature.role,
        rarity: creature.rarity,
        attack: creature.stats.attack,
        defense: creature.stats.defense,
        speed: creature.stats.speed,
        wisdom: creature.stats.wisdom,
        luck: creature.stats.luck,
        flavorText: creature.flavorText,
        imageUrl: creature.imageUrl,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "User and creature saved successfully", user, creature: savedCreature }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error saving user and creature data:", error);
    return new NextResponse(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
