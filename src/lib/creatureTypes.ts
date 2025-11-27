export interface CreatureType {
  type: string;
  description: string;
  statWeights: {
    attack: number;
    defense: number;
    speed: number;
    wisdom: number;
    luck: number;
  };
}

export interface CreatureStats {
  attack: number;
  defense: number;
  speed: number;
  wisdom: number;
  luck: number;
}

export interface AssignedCreature {
  name: string;
  type: string;
  role: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  stats: CreatureStats;
  flavorText: string;
  imageUrl: string;
}

export const CREATURE_TYPES: CreatureType[] = [
  {
    type: "Fire",
    description: "Bold, aggressive, high attack - for active traders",
    statWeights: {
      attack: 1.5,
      defense: 0.8,
      speed: 1.2,
      wisdom: 0.7,
      luck: 1.0,
    },
  },
  {
    type: "Water",
    description: "Adaptive, balanced, defensive - for hodlers",
    statWeights: {
      attack: 1.0,
      defense: 1.3,
      speed: 1.0,
      wisdom: 1.1,
      luck: 0.9,
    },
  },
  {
    type: "Electric",
    description: "Fast, energetic, high speed - for frequent transactors",
    statWeights: {
      attack: 1.1,
      defense: 0.9,
      speed: 1.6,
      wisdom: 0.8,
      luck: 1.2,
    },
  },
  {
    type: "Psychic",
    description: "Strategic, high wisdom, low speed - for NFT collectors",
    statWeights: {
      attack: 0.8,
      defense: 1.0,
      speed: 0.7,
      wisdom: 1.6,
      luck: 1.1,
    },
  },
  {
    type: "Dark",
    description: "Mysterious, balanced power - for DeFi users",
    statWeights: {
      attack: 1.2,
      defense: 1.1,
      speed: 1.0,
      wisdom: 1.3,
      luck: 0.8,
    },
  },
  {
    type: "Steel",
    description: "Defensive, resilient - for long-term holders",
    statWeights: {
      attack: 0.9,
      defense: 1.5,
      speed: 0.7,
      wisdom: 1.2,
      luck: 1.0,
    },
  },
  {
    type: "Dragon",
    description: "Powerful, legendary - for whales and high-value wallets",
    statWeights: {
      attack: 1.4,
      defense: 1.3,
      speed: 1.2,
      wisdom: 1.4,
      luck: 1.5,
    },
  },
  {
    type: "Ghost",
    description: "Elusive, luck-based - for new or inactive wallets",
    statWeights: {
      attack: 0.7,
      defense: 0.8,
      speed: 1.1,
      wisdom: 0.9,
      luck: 1.6,
    },
  },
  {
    type: "Grass",
    description: "Growth-oriented, steady - for consistent transactors",
    statWeights: {
      attack: 1.1,
      defense: 1.2,
      speed: 0.9,
      wisdom: 1.1,
      luck: 1.0,
    },
  },
  {
    type: "Ice",
    description: "Cold storage, preserved value - for dormant whales",
    statWeights: {
      attack: 1.3,
      defense: 1.4,
      speed: 0.8,
      wisdom: 1.2,
      luck: 0.9,
    },
  },
  {
    type: "Rock",
    description: "Solid, unshakeable foundation - for long history wallets",
    statWeights: {
      attack: 1.0,
      defense: 1.6,
      speed: 0.6,
      wisdom: 1.0,
      luck: 1.1,
    },
  },
];

export const RARITY_THRESHOLDS = {
  LEGENDARY: 5000,
  EPIC: 2000,
  RARE: 500,
  COMMON: 0,
};
