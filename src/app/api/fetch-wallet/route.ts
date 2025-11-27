import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

// Simple in-memory cache (10-minute TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface WalletProfile {
  walletAddress: string;
  chain: string;
  resolvedName: string | null;
  nativeBalance: string;
  nativeBalanceUSD: number;
  tokenValueUSD: number;
  nftCount: number;
  txCount: number;
  erc20Balances: Array<{
    symbol: string;
    balance: string;
    valueUSD: number;
  }>;
  powerScore: number;
  lastActiveTimestamp: number;
}

function getRpcUrl(chain: string, apiKey: string) {
  const networks: Record<string, string> = {
    ethereum: `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
    base: `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
    polygon: `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
    arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`,
    optimism: `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`,
  };

  const url = networks[chain.toLowerCase()];
  if (!url) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return url;
}

async function rpcCall(url: string, method: string, params: any[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

function getNftUrl(chain: string, apiKey: string) {
  const networks: Record<string, string> = {
    ethereum: `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
    base: `https://base-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
    polygon: `https://polygon-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
    arbitrum: `https://arb-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
    optimism: `https://opt-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
  };

  const url = networks[chain.toLowerCase()];
  if (!url) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return url;
}

async function fetchEVMWalletData(
  address: string,
  chain: string
): Promise<WalletProfile> {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not set");

  const rpcUrl = getRpcUrl(chain, apiKey);
  const nftUrl = `${getNftUrl(chain, apiKey)}?owner=${address}&withMetadata=false&pageSize=1`;

  // Parallelize requests for speed
  const [txCountHex, balanceHex, tokenBalancesData, nftsData] = await Promise.all([
    rpcCall(rpcUrl, "eth_getTransactionCount", [address, "latest"]),
    rpcCall(rpcUrl, "eth_getBalance", [address, "latest"]),
    rpcCall(rpcUrl, "alchemy_getTokenBalances", [address]),
    fetch(nftUrl).then(res => res.json()),
  ]);

  // Parse Tx Count
  const txCount = parseInt(txCountHex, 16);

  // Parse Native Balance
  const nativeBalance = ethers.formatEther(balanceHex);

  // Parse NFT Count
  const nftCount = nftsData.totalCount || 0;

  // Parse Token Balances
  const erc20Balances: Array<{
    symbol: string;
    balance: string;
    valueUSD: number;
  }> = [];

  let tokenValueUSD = 0;

  // Process top tokens (limit to 10 to avoid too many metadata calls)
  const nonZeroTokens = tokenBalancesData.tokenBalances
    .filter((t: any) => t.tokenBalance !== "0x0") // Alchemy returns hex string or "0x0"
    .slice(0, 10);

  for (const token of nonZeroTokens) {
    try {
      const metadata = await rpcCall(rpcUrl, "alchemy_getTokenMetadata", [
        token.contractAddress,
      ]);

      if (metadata.decimals) {
        const balance = ethers.formatUnits(token.tokenBalance, metadata.decimals);
        // Mock USD value
        const valueUSD = parseFloat(balance) * 10; // Placeholder $10 per token
        
        erc20Balances.push({
          symbol: metadata.symbol || "UNKNOWN",
          balance,
          valueUSD,
        });
        tokenValueUSD += valueUSD;
      }
    } catch (e) {
      console.warn("Failed to fetch metadata for token:", token.contractAddress);
    }
  }

  // Resolve ENS (only on Ethereum)
  let resolvedName: string | null = null;
  if (chain.toLowerCase() === "ethereum") {
    try {
      // Simple reverse lookup via RPC is complex, skipping for now or use a dedicated library if needed.
      // For now, we'll leave it null or implement if critical.
      // Actually, we can use the mainnet RPC to call the ENS registry, but it's heavy.
      // Let's skip ENS for this lightweight implementation to ensure stability.
    } catch (e) {
      console.warn("ENS lookup failed");
    }
  }

  // Calculate native balance USD
  const ethPriceUSD = 3000; // Placeholder
  const nativeBalanceUSD = parseFloat(nativeBalance) * ethPriceUSD;

  // Calculate power score
  const powerScore = calculatePowerScore({
    txCount,
    nftCount,
    tokenValueUSD,
    nativeBalanceUSD,
  });

  return {
    walletAddress: address,
    chain,
    resolvedName,
    nativeBalance,
    nativeBalanceUSD,
    tokenValueUSD,
    nftCount,
    txCount,
    erc20Balances,
    powerScore,
    lastActiveTimestamp: Date.now(),
  };
}

function calculatePowerScore({
  txCount,
  nftCount,
  tokenValueUSD,
  nativeBalanceUSD,
}: {
  txCount: number;
  nftCount: number;
  tokenValueUSD: number;
  nativeBalanceUSD: number;
}): number {
  const txWeight = txCount * 2;
  const nftWeight = nftCount * 50;
  const tokenWeight = Math.log10(tokenValueUSD + 1) * 100;
  const nativeWeight = Math.log10(nativeBalanceUSD + 1) * 50;

  return Math.floor(txWeight + nftWeight + tokenWeight + nativeWeight);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const chain = searchParams.get("chain") || "base";

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address" },
        { status: 400 }
      );
    }

    const cacheKey = `${chain}:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const walletProfile = await fetchEVMWalletData(address, chain);

    cache.set(cacheKey, {
      data: walletProfile,
      timestamp: Date.now(),
    });

    return NextResponse.json(walletProfile);
  } catch (error: any) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
