"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-black to-black -z-20" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#200_1px,transparent_1px),linear-gradient(to_bottom,#200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-20" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]">
            POKÉ<br className="md:hidden" />TRAINER
          </h1>
          <p className="text-xl md:text-2xl text-red-200/80 font-bold tracking-widest uppercase">
            Web3 Companion Chronicles
          </p>
        </motion.div>

        {/* Creature Showcase Carousel */}
        <div className="relative w-full max-w-4xl h-[300px] md:h-[400px] mb-16 flex items-center justify-center">
          {/* Center Hero */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative w-64 h-64 md:w-96 md:h-96 z-20"
          >
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
            <Image 
              src="/creatures/dragon.png" 
              alt="Dragon" 
              fill 
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Side Creatures */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="absolute left-0 md:left-20 w-40 h-40 md:w-60 md:h-60 z-10 blur-[2px] grayscale-[50%]"
          >
            <Image src="/creatures/fire.png" alt="Fire" fill className="object-contain" />
          </motion.div>

          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 md:right-20 w-40 h-40 md:w-60 md:h-60 z-10 blur-[2px] grayscale-[50%]"
          >
            <Image src="/creatures/electric.png" alt="Electric" fill className="object-contain" />
          </motion.div>
        </div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <Link href="/assign">
            <Button 
              size="lg" 
              className="text-2xl md:text-3xl font-black px-12 py-8 bg-red-600 hover:bg-red-500 text-white border-4 border-red-800 hover:border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all duration-300 uppercase tracking-widest clip-path-polygon transform hover:scale-105"
            >
              Start Adventure
            </Button>
          </Link>
          
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mt-6 text-red-400/60 font-mono text-sm"
          >
            PRESS START TO CONNECT WALLET
          </motion.p>
        </motion.div>

      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-900 via-red-600 to-red-900" />
    </div>
  );
}
