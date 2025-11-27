"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: number;
  walletAddress: string;
  resolvedName: string | null;
  chain: string;
  powerScore: number;
  nftCount: number;
  txCount: number;
  creatures: {
    name: string;
    type: string;
    rarity: string;
    role: string;
    imageUrl: string | null;
    createdAt: string;
  }[];
}

const Vote = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get("/api/getAllUser");
        setUsers(response.data);
        const reverse = response.data.reverse();
        setFilteredUsers(reverse);
      } catch (error) {
        setMessage("Unable to fetch users.");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = users.filter((user) => {
      const displayName = user.resolvedName || user.walletAddress;
      return displayName.toLowerCase().includes(query.toLowerCase());
    });
    setFilteredUsers(filtered);
  };

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
    if (["fire", "water", "electric", "dragon", "psychic", "dark", "steel"].includes(lowerType)) {
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
    <div className="min-h-screen w-full">
      {loadingUsers ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      ) : (
        <div className="min-h-screen flex justify-center px-4 sm:px-6 lg:px-8 mb-24 flex-col items-center">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
              Trainer Profiles
            </h2>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by address or name..."
              className="w-full p-2 sm:p-3 mb-4 sm:mb-6 border border-red-600 bg-black bg-stone-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            {filteredUsers.length === 0 ? (
              <p className="text-center text-white">No trainers available.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredUsers.map((user) => {
                  const displayName =
                    user.resolvedName ||
                    `${user.walletAddress.slice(
                      0,
                      6
                    )}...${user.walletAddress.slice(-4)}`;
                  const latestCreature = user.creatures?.[0];

                  return (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row items-center sm:justify-between p-3 sm:p-4 border border-red-900 rounded-lg text-white bg-stone-950 gap-3 sm:gap-4"
                    >
                      <div className="flex items-center w-full sm:w-auto">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-red-500 flex items-center justify-center bg-stone-800 text-2xl overflow-hidden">
                          {latestCreature ? (
                            <Image
                              src={
                                latestCreature.imageUrl?.startsWith("/")
                                  ? latestCreature.imageUrl
                                  : getCreatureImage(latestCreature.type)
                              }
                              alt={latestCreature.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🔥"
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <p className="font-bold text-base sm:text-lg">
                            {displayName}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center">
                            {latestCreature && (
                              <>
                                <p className="text-sm sm:text-md text-red-400">
                                  {latestCreature.name}
                                </p>
                                <p
                                  className={`text-xs sm:text-sm font-bold px-2 py-1 rounded-md bg-gradient-to-r ${getRarityColor(
                                    latestCreature.rarity
                                  )}`}
                                >
                                  {latestCreature.rarity}
                                </p>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Power: {user.powerScore} • {user.txCount} txs •{" "}
                            {user.nftCount} NFTs
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/profile/id?address=${user.walletAddress}`}
                        className="w-full sm:w-auto"
                      >
                        <button className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base font-medium">
                          Visit Profile
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {message && (
              <p className="text-center mt-4 sm:mt-6 text-base sm:text-lg font-semibold text-white">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;
