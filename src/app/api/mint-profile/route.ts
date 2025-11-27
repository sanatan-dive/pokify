import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MintProfileRequest {
  walletAddress: string;
  creatureId: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { walletAddress, creatureId }: MintProfileRequest = await req.json();

    if (!walletAddress || !creatureId) {
      return NextResponse.json(
        { error: "Wallet address and creature ID are required" },
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

    if (creature.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Wallet address does not match creature owner" },
        { status: 403 }
      );
    }

    // Check if already minted
    if (creature.onChainTokenId) {
      return NextResponse.json(
        { error: "This profile has already been minted", tokenId: creature.onChainTokenId },
        { status: 400 }
      );
    }

    // Generate metadata URI (just the creature ID, full URL constructed in contract)
    const metadataURI = creatureId.toString();

    const contractAddress = process.env.NEXT_PUBLIC_TRAINER_PROFILE_CONTRACT_ADDRESS;
    const mintFee = "0.001"; // 0.001 ETH

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract not deployed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contractAddress,
      metadataURI,
      mintFee,
      creature: {
        name: creature.name,
        type: creature.type,
        rarity: creature.rarity,
      },
    });
  } catch (error: any) {
    console.error("Error preparing mint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to prepare mint" },
      { status: 500 }
    );
  }
}
