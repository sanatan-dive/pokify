"use client";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useRef } from "react";
import { AssignedCreature } from "@/lib/creatureTypes";
import html2canvas from "html2canvas";
import { FaDownload, FaWallet } from "react-icons/fa6";
import { TRAINER_PROFILE_ABI } from "@/lib/TrainerProfileABI";
import { parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { CreatureCard } from "@/components/CreatureCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Loader2, Sparkles } from "lucide-react";

export default function AssignPage() {
  const { address, chain, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [minting, setMinting] = useState(false);
  const [walletProfile, setWalletProfile] = useState<any>(null);
  const [creature, setCreature] = useState<AssignedCreature | null>(null);
  const [creatureId, setCreatureId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const fetchWalletData = async () => {
    if (!address || !chain) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch wallet profile
      const chainName = chain.name.toLowerCase().replace(" ", "");
      const walletRes = await fetch(
        `/api/fetch-wallet?address=${address}&chain=${chainName}`
      );

      if (!walletRes.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const profile = await walletRes.json();
      setWalletProfile(profile);

      // Assign creature
      const creatureRes = await fetch("/api/assign-creature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!creatureRes.ok) {
        throw new Error("Failed to assign creature");
      }

      const assignedCreature = await creatureRes.json();
      setCreature(assignedCreature);

      // Save to database
      setSaving(true);
      const saveRes = await fetch("/api/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          creature: assignedCreature,
        }),
      });

      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setCreatureId(savedData.creature.id);
      }
      setSaving(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `trainer-card-${creature?.name}.png`;
        link.click();
      } catch (error) {
        console.error("Failed to generate image:", error);
      }
    }
  };

  const handleMint = async () => {
    if (!address || !creature || !creatureId) return;

    setMinting(true);
    setError(null);

    try {
      // Get mint data from backend
      const mintRes = await fetch("/api/mint-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, creatureId }),
      });

      if (!mintRes.ok) {
        const errorData = await mintRes.json();
        throw new Error(errorData.error || "Failed to prepare mint");
      }

      const { contractAddress, metadataURI, mintFee } = await mintRes.json();

      // Call contract mint function
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: TRAINER_PROFILE_ABI,
        functionName: "mint",
        args: [metadataURI],
        value: parseEther(mintFee),
      });
    } catch (err: any) {
      setError(err.message || "Minting failed");
      setMinting(false);
    }
  };

  // Handle successful mint
  if (isConfirmed && minting) {
    setMinting(false);
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "from-slate-600 to-slate-800";
      case "Rare":
        return "from-blue-600 to-blue-800";
      case "Epic":
        return "from-purple-600 to-purple-800";
      case "Legendary":
        return "from-amber-500 to-red-600";
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 k -z-10" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-red-500 to-red-700">
              POKÉ
            </span>
            <span className="text-white">TRAINER</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Connect your wallet to summon your on-chain companion.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-md mx-auto border-red-900/50 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/50 border-4 border-black ring-2 ring-red-600">
                    <div className="w-full h-2 bg-black absolute rotate-45 opacity-20"></div>
                    <div className="w-6 h-6 bg-white rounded-full border-4 border-black z-10"></div>
                  </div>
                  <CardTitle className="text-2xl text-white">
                    Connect Wallet
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Access the network to identify your trainer ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletConnect />
                </CardContent>
              </Card>
            </motion.div>
          ) : !creature ? (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 max-w-md mx-auto"
            >
              <Card className="border-red-900/30 bg-black/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    System Online
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Trainer ID Verified: {address?.slice(0, 6)}...
                    {address?.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <WalletConnect />
                  </div>
                  <Button
                    onClick={fetchWalletData}
                    disabled={loading || saving}
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/20 uppercase tracking-wider clip-path-polygon"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" /> SCANNING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-red-600">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        SUMMON CREATURE
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {loading && <LoadingSkeleton />}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-center font-mono text-sm"
                >
                  ERROR: {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-center perspective-1000">
                {/* CARD REVEAL ANIMATION */}
                <motion.div
                  initial={{
                    scale: 0.6,
                    rotateY: 180,
                    opacity: 0,
                    filter: "brightness(2)",
                  }}
                  animate={{
                    scale: 1,
                    rotateY: 0,
                    opacity: 1,
                    filter: "brightness(1)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 20,
                    mass: 1.2,
                    delay: 0.3,
                  }}
                >
                  <CreatureCard
                    ref={cardRef}
                    creature={creature}
                    walletProfile={walletProfile}
                    getRarityColor={getRarityColor}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center p-6 bg-red-950/20 rounded-2xl border border-red-900/30 backdrop-blur-sm max-w-2xl mx-auto">
                  <Button
                    onClick={downloadCard}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-red-900/50 hover:bg-red-950/50 text-red-200 hover:text-white"
                  >
                    <FaDownload className="mr-2" />
                    SAVE CARD
                  </Button>

                  <Button
                    onClick={() =>
                      window.open("https://creator.bid/", "_blank")
                    }
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border border-white/10 shadow-lg shadow-purple-500/20 font-bold"
                  >
                    🚀 LAUNCH AGENT
                  </Button>

                  <Button
                    onClick={handleMint}
                    disabled={minting || isPending || isConfirming}
                    size="lg"
                    className={`w-full sm:w-auto min-w-[200px] font-bold text-white shadow-lg transition-all duration-300 border border-white/10 ${
                      isConfirmed
                        ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                        : "bg-gradient-to-r from-red-600 to-red-800 hover:scale-105 shadow-red-600/30"
                    }`}
                  >
                    {minting || isPending || isConfirming ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        {isPending
                          ? "CONFIRM..."
                          : isConfirming
                          ? "MINTING..."
                          : "PREPARING..."}
                      </>
                    ) : isConfirmed ? (
                      <>✅ REGISTERED!</>
                    ) : (
                      <>🔥 MINT ON BASE</>
                    )}
                  </Button>
                </div>

                {/* Auto-save indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2 text-green-400 text-sm font-mono bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
                    <Sparkles className="w-3 h-3" />
                    Creature automatically saved to collection
                  </div>
                  <p className="text-xs text-gray-500 max-w-md text-center mt-2">
                    Mint your creature to activate its autonomous agent
                    capabilities on CreatorBid.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-center"
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCreature(null);
                    setWalletProfile(null);
                  }}
                  className="text-gray-500 hover:text-red-400 hover:bg-transparent"
                >
                  SCAN ANOTHER WALLET
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
