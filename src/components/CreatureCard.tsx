import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignedCreature } from "@/lib/creatureTypes";
import { motion } from "framer-motion";
import Image from "next/image";
import { forwardRef } from "react";

interface CreatureCardProps {
  creature: AssignedCreature;
  walletProfile: any;
  getRarityColor: (rarity: string) => string;
}

export const CreatureCard = forwardRef<HTMLDivElement, CreatureCardProps>(
  ({ creature, walletProfile, getRarityColor }, ref) => {
    // Map creature type to image path
    const getCreatureImage = (type: string) => {
      const lowerType = type.toLowerCase();
      if (["fire", "water", "electric", "dragon", "psychic", "dark", "steel"].includes(lowerType)) {
        return `/creatures/${lowerType}.png`;
      }
      // Fallbacks
      if (lowerType === "ghost") return "/creatures/psychic.png"; // Fallback to psychic for now
      if (lowerType === "grass") return "/creatures/dragon.png"; // Fallback
      if (lowerType === "rock") return "/creatures/steel.png"; // Fallback
      return "/creatures/dragon.png";
    };

    return (
      <div ref={ref} className="perspective-1000">
        <motion.div
          whileHover={{ scale: 1.02, rotateY: 2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-4 border-black bg-stone-900 overflow-hidden shadow-2xl relative">
            {/* Card Frame Decoration */}
            <div className="absolute inset-0 border-[12px] border-stone-800 pointer-events-none z-20 rounded-xl" />
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-30" />
            
            <CardHeader className="relative z-10 bg-stone-900 pt-8 pb-2 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white italic">
                    {creature.name}
                  </CardTitle>
                  <CardDescription className="text-red-400 font-bold text-xs uppercase tracking-widest">
                    {walletProfile.resolvedName || "Unknown Trainer"}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-stone-500 uppercase">HP</span>
                  <span className="text-xl font-black text-white">{walletProfile.powerScore}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 relative z-10 px-6 pb-8">
              {/* Creature Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden border-4 border-stone-700 bg-black shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-black opacity-50" />
                <Image
                  src={
                    creature.imageUrl?.startsWith("/") 
                      ? creature.imageUrl 
                      : getCreatureImage(creature.type)
                  }
                  alt={creature.name}
                  fill
                  className="object-cover"
                />
                
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(creature.rarity)} border-2 border-white/20 shadow-lg`}>
                  <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
                    {creature.rarity}
                  </span>
                </div>
              </div>

              {/* Type & Role Strip */}
              <div className="flex gap-2">
                <div className="flex-1 bg-stone-800 rounded px-3 py-1 flex items-center justify-between border border-stone-700">
                  <span className="text-[10px] uppercase text-stone-400 font-bold">Type</span>
                  <span className="text-sm font-bold text-white uppercase">{creature.type}</span>
                </div>
                <div className="flex-1 bg-stone-800 rounded px-3 py-1 flex items-center justify-between border border-stone-700">
                  <span className="text-[10px] uppercase text-stone-400 font-bold">Role</span>
                  <span className="text-sm font-bold text-white uppercase">{creature.role}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-2 bg-stone-800/50 p-3 rounded-lg border border-stone-700/50">
                {Object.entries(creature.stats).map(([stat, value], i) => (
                  <div key={stat} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-bold uppercase text-stone-400">
                      {stat}
                    </span>
                    <div className="flex-1 bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-700">
                      <motion.div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 1 + i * 0.1, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-6 text-xs font-bold text-right text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Flavor Text */}
              <div className="p-3 bg-stone-100 rounded border-2 border-stone-300">
                <p className="text-xs text-stone-800 font-medium italic leading-relaxed">
                  "{creature.flavorText}"
                </p>
              </div>
              
              {/* Bottom Footer Decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-stone-800 border-t border-stone-700 flex items-center justify-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-red-500" />
                 <div className="w-1 h-1 rounded-full bg-stone-600" />
                 <div className="w-1 h-1 rounded-full bg-stone-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
);

CreatureCard.displayName = "CreatureCard";
