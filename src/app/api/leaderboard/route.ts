import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Rarity hierarchy for sorting
const getRarityWeight = (rarity: string): number => {
  switch (rarity) {
    case "Legendary":
      return 4;
    case "Epic":
      return 3;
    case "Rare":
      return 2;
    case "Common":
      return 1;
    default:
      return 0;
  }
};

export async function GET(): Promise<Response> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        resolvedName: true,
        powerScore: true,
        nftCount: true,
        txCount: true,
        chain: true,
        creatures: {
          select: {
            name: true,
            rarity: true,
            type: true,
            imageUrl: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 100,
    });

    // Sort by rarity hierarchy first, then by powerScore
    const sortedUsers = users.sort((a, b) => {
      const rarityA = a.creatures[0]?.rarity || "Common";
      const rarityB = b.creatures[0]?.rarity || "Common";
      const weightDiff = getRarityWeight(rarityB) - getRarityWeight(rarityA);

      if (weightDiff !== 0) return weightDiff;
      return b.powerScore - a.powerScore;
    });

    // Map to frontend structure
    const leaderboard = sortedUsers.map(user => ({
      ...user,
      latestCreature: user.creatures[0] || null,
      creatures: undefined // Remove the array to keep it clean
    }));

    return new Response(JSON.stringify(leaderboard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
