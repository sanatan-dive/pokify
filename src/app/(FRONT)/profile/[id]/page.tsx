"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Flame } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Loading from "@/components/Loading";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreatureCard } from "@/components/CreatureCard";

const Profile = () => {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const pathName = usePathname(); // Correct way to use useSearchParams

  useEffect(() => {
    const walletAddress = searchParams?.get("address");

    if (!walletAddress) {
      console.error("Missing wallet address");
      return;
    }

    // Fetch user data based on the wallet address
    axios
      .get(`/api/getUser?address=${walletAddress}`)
      .then((response) => {
        if (response.data) {
          setUserData(response.data); // Set the user data from the database
        } else {
          setUserData(null); // No data found in database
        }
      })
      .catch((error) => {
        // console.log("Error fetching user data:", error);
        setUserData(null); // Handle error by setting data as null
      })
      .finally(() => setLoading(false));

    // console.log(userData)
  }, [searchParams]); // Use searchParams as a dependency

  // Rarity background
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

  const calculatePostFrequency = (txCount: number, days: number = 30) => {
    if (days === 0) return "0"; // Prevent division by zero
    return (txCount / days).toFixed(1);
  };

  const creature = userData?.creatures?.[0];
  const formattedCreature = creature
    ? {
        ...creature,
        stats: {
          attack: creature.attack || 0,
          defense: creature.defense || 0,
          speed: creature.speed || 0,
          wisdom: creature.wisdom || 0,
          luck: creature.luck || 0,
        },
      }
    : null;

  // Handle loading state
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );

  // Render profile or no data found message
  return (
    <div className="p-8 flex flex-col items-center min-h-screen justify-center">
      {!userData ? (
        <div className="text-center text-xl font-semibold text-red-500">
          No data found in database
          <div>
            <Link className="text-blue-500 hover:underline gap-2" href="/">
              Visit Home Page
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          {formattedCreature ? (
            <CreatureCard
              creature={formattedCreature}
              walletProfile={userData}
              getRarityColor={getRarityColor}
            />
          ) : (
            <div className="text-center text-white">
              No creature found for this trainer.
            </div>
          )}

          {/* Additional Stats Footer */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
              <div className="text-xs text-stone-400 uppercase font-bold mb-1">
                Transactions
              </div>
              <div className="text-xl font-bold text-white">
                {userData.txCount}
              </div>
            </div>
            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
              <div className="text-xs text-stone-400 uppercase font-bold mb-1">
                NFTs
              </div>
              <div className="text-xl font-bold text-white">
                {userData.nftCount}
              </div>
            </div>
            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
              <div className="text-xs text-stone-400 uppercase font-bold mb-1">
                Tx/Day
              </div>
              <div className="text-xl font-bold text-white">
                {calculatePostFrequency(userData.txCount)}
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={`https://basescan.org/address/${userData.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-500 hover:text-red-400 transition-colors inline-flex items-center gap-2"
            >
              View on Explorer
              <Flame className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
