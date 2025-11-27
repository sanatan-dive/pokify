import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CREATURE_TYPES,
  RARITY_THRESHOLDS,
  AssignedCreature,
  CreatureStats,
} from "@/lib/creatureTypes";

interface WalletProfile {
  walletAddress: string;
  chain: string;
  resolvedName: string | null;
  nativeBalanceUSD: number;
  tokenValueUSD: number;
  nftCount: number;
  txCount: number;
  powerScore: number;
  erc20Balances?: Array<{
    symbol: string;
    balance: string;
    valueUSD: number;
  }>;
}

interface LLMResponse {
  name: string;
  flavorText: string;
}

function determineRarity(
  powerScore: number
): "Common" | "Rare" | "Epic" | "Legendary" {
  // Completely random rarity as requested
  const rand = Math.random();
  if (rand > 0.95) return "Legendary"; // 5% chance
  if (rand > 0.8) return "Epic"; // 15% chance
  if (rand > 0.5) return "Rare"; // 30% chance
  return "Common"; // 50% chance
}

function selectCreatureType(profile: WalletProfile): string {
  const { nftCount, txCount, tokenValueUSD, nativeBalanceUSD, erc20Balances } =
    profile;

  // RWA Check (Collector Crypt, Beezie) - Keep this for Hackathon requirement
  const hasRWATokens = erc20Balances?.some((token) =>
    ["COLL", "BEEZ", "RWA", "COLLECTOR", "REAL"].includes(
      token.symbol.toUpperCase()
    )
  );

  if (hasRWATokens) {
    return "Rock";
  }

  // Randomize the rest of the types
  const types = CREATURE_TYPES.map((ct) => ct.type).filter((t) => t !== "Rock"); // Exclude Rock as it's special
  return types[Math.floor(Math.random() * types.length)];
}

function determineRole(type: string, stats: CreatureStats): string {
  if (stats.attack > 80) return "Attacker";
  if (stats.defense > 80) return "Defender";
  if (stats.speed > 80) return "Speedster";
  if (stats.wisdom > 80) return "Strategist";
  return "Balanced";
}

function generateStats(
  type: string,
  rarity: string,
  powerScore: number
): CreatureStats {
  const creatureType = CREATURE_TYPES.find((ct) => ct.type === type);
  if (!creatureType) {
    throw new Error(`Unknown creature type: ${type}`);
  }

  const rarityMultiplier =
    {
      Common: 0.8,
      Rare: 1.0,
      Epic: 1.2,
      Legendary: 1.5,
    }[rarity] || 1.0;

  // Random stats
  const random = () => 0.5 + Math.random() * 0.5; // 0.5 to 1.0

  const baseStats = creatureType.statWeights;

  return {
    attack: Math.min(
      100,
      Math.floor(baseStats.attack * random() * rarityMultiplier * 50)
    ),
    defense: Math.min(
      100,
      Math.floor(baseStats.defense * random() * rarityMultiplier * 50)
    ),
    speed: Math.min(
      100,
      Math.floor(baseStats.speed * random() * rarityMultiplier * 50)
    ),
    wisdom: Math.min(
      100,
      Math.floor(baseStats.wisdom * random() * rarityMultiplier * 50)
    ),
    luck: Math.min(
      100,
      Math.floor(baseStats.luck * random() * rarityMultiplier * 50)
    ),
  };
}

async function generateCreatureNameAndLore(
  profile: WalletProfile,
  type: string,
  rarity: string,
  stats: CreatureStats
): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback if no API key
    return {
      name: `${rarity} ${type}mon`,
      flavorText: `A ${rarity.toLowerCase()} ${type.toLowerCase()}-type creature from the ${
        profile.chain
      } realm.`,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a creative Web3 creature designer. Generate a unique creature for a wallet owner.

Wallet Stats:
- Chain: ${profile.chain}
- Transaction Count: ${profile.txCount}
- NFT Collection Size: ${profile.nftCount}
- Portfolio Value: $${(
      profile.tokenValueUSD + profile.nativeBalanceUSD
    ).toFixed(2)}
- Wallet Name: ${profile.resolvedName || "Anonymous"}

Assigned Type: ${type} (${
      CREATURE_TYPES.find((ct) => ct.type === type)?.description
    })
Rarity: ${rarity}
Stats: Attack ${stats.attack}, Defense ${stats.defense}, Speed ${
      stats.speed
    }, Wisdom ${stats.wisdom}, Luck ${stats.luck}

Generate:
1. A unique 2-word fantasy creature name (like "Blazefang" or "Shadowclaw"). DO NOT use Pokemon names.
2. A 1-2 sentence Pokedex-style description that ties the creature to the wallet's on-chain behavior.

Return ONLY a JSON object with keys "name" and "flavorText".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || `${rarity} ${type}mon`,
        flavorText:
          parsed.flavorText ||
          `A ${rarity.toLowerCase()} ${type.toLowerCase()}-type creature.`,
      };
    }

    // Fallback parsing
    return {
      name: `${rarity} ${type}mon`,
      flavorText: text.substring(0, 200),
    };
  } catch (error) {
    console.error("LLM generation failed:", error);
    return {
      name: `${rarity} ${type}mon`,
      flavorText: `A ${rarity.toLowerCase()} ${type.toLowerCase()}-type creature from the ${
        profile.chain
      } realm.`,
    };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const profile: WalletProfile = await req.json();

    if (!profile.walletAddress || profile.powerScore === undefined) {
      return NextResponse.json(
        { error: "Invalid wallet profile data" },
        { status: 400 }
      );
    }

    // Determine rarity and type
    const rarity = determineRarity(profile.powerScore);
    const type = selectCreatureType(profile);

    // Generate stats
    const stats = generateStats(type, rarity, profile.powerScore);

    // Determine role
    const role = determineRole(type, stats);

    // Generate name and lore using LLM
    const { name, flavorText } = await generateCreatureNameAndLore(
      profile,
      type,
      rarity,
      stats
    );

    // Generate image URL using Robohash based on creature name
    const imageUrl = `https://robohash.org/${encodeURIComponent(
      name
    )}?set=set4&bgset=bg1`;

    const creature: AssignedCreature = {
      name,
      type,
      role,
      rarity,
      stats,
      flavorText,
      imageUrl,
    };

    return NextResponse.json(creature);
  } catch (error: any) {
    console.error("Error assigning creature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign creature" },
      { status: 500 }
    );
  }
}
