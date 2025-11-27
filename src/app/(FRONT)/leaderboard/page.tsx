"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import { RainbowButton } from "@/components/ui/rainbow-button";

// Define the User interface to specify the shape of the data
interface User {
  walletAddress: string;
  resolvedName: string | null;
  powerScore: number;
  nftCount: number;
  txCount: number;
  chain: string;
  creatures: {
    name: string;
    type: string;
    rarity: string;
    imageUrl: string | null;
  }[];
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get("/api/leaderboard");
        setLoadingUsers(false);
        // Data is already sorted by powerScore desc from the API
        console.log(response.data);
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoadingUsers(false); // Stop loading even if there's an error
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to filter users based on the search query
  const filteredLeaderboard = leaderboard.filter((user) => {
    const displayName = user.resolvedName || user.walletAddress;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "from-blue-700 via-blue-400 to-blue-700";
      case "Rare":
        return "from-purple-500 via-pink-400 to-purple-500";
      case "Epic":
        return "from-pink-500 via-purple-400 to-pink-500";
      case "Legendary":
        return "from-red-500 via-yellow-500 to-red-500";
      default:
        return "from-gray-500 to-gray-700";
    }
  };

  const getCreatureImage = (type: string) => {
    const lowerType = type.toLowerCase();
    if (
      [
        "fire",
        "water",
        "electric",
        "dragon",
        "psychic",
        "dark",
        "steel",
      ].includes(lowerType)
    ) {
      return `/creatures/${lowerType}.png`;
    }
    // Fallbacks
    if (lowerType === "grass") return "/creatures/water.png";
    if (lowerType === "ice") return "/creatures/water.png";
    if (lowerType === "rock") return "/creatures/steel.png";
    if (lowerType === "ghost") return "/creatures/psychic.png";
    return "/creatures/dragon.png";
  };

  return (
    <div className="min-h-screen flex justify-center flex-col items-center p-3 sm:p-4 md:p-6">
      {loadingUsers ? (
        <Loading />
      ) : (
        <div className="w-full max-w-2xl p-3 sm:p-4 md:p-6 mb-16 sm:mb-20 md:mb-24 bg-stone-900 rounded-xl shadow-xl border border-red-600">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-white mb-4 sm:mb-6">
            Trainer Leaderboard
          </h2>

          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address or name"
              className="w-full p-2 sm:p-3 bg-stone-800 text-white rounded-md shadow-md border border-stone-700 focus:border-red-500 focus:outline-none"
            />
          </div>

          {filteredLeaderboard.length === 0 ? (
            <p className="text-center text-white text-sm sm:text-base">
              No trainers found.
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4 md:space-y-6">
              {filteredLeaderboard.map((user, index) => {
                const rank = index + 1;
                const displayName =
                  user.resolvedName ||
                  `${user.walletAddress.slice(
                    0,
                    6
                  )}...${user.walletAddress.slice(-4)}`;
                const creature = user.creatures?.[0];

                return (
                  <li
                    key={user.walletAddress}
                    className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-stone-950 border border-stone-800 rounded-lg shadow-md hover:border-red-600 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full">
                      <span className="text-base sm:text-lg font-bold text-red-400 min-w-[24px] sm:min-w-[28px] text-center">
                        #{rank}
                      </span>

                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-red-500 flex items-center justify-center bg-stone-800 text-2xl overflow-hidden">
                        {creature ? (
                          <img
                            src={
                              creature.imageUrl?.startsWith("/") ||
                              creature.imageUrl?.startsWith("http")
                                ? creature.imageUrl
                                : getCreatureImage(creature.type)
                            }
                            alt={creature.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🔥"
                        )}
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm sm:text-base md:text-lg">
                            {displayName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {creature && (
                              <>
                                <p className="text-xs sm:text-sm md:text-md text-red-400">
                                  {creature.name}
                                </p>
                                {creature.rarity === "Legendary" ? (
                                  <RainbowButton className="text-xs sm:text-sm font-bold px-2 py-0.5 w-auto h-auto">
                                    <span className="relative z-10 text-white">
                                      {creature.rarity}
                                    </span>
                                  </RainbowButton>
                                ) : (
                                  <p
                                    className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-md bg-gradient-to-r ${getRarityColor(
                                      creature.rarity
                                    )}`}
                                  >
                                    {creature.rarity}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs sm:text-sm text-gray-400">
                            Power:{" "}
                            <span className="text-red-400 font-bold">
                              {user.powerScore}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.txCount} txs • {user.nftCount} NFTs
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
