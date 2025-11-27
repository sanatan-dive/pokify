# PokéTrainer: The AI Agent Launchpad 🔴⚪️

**Winner of the "Most Autonomous Agent" & "Best Use of RWA" Categories (Target)**

PokéTrainer is a wallet-aware AI Agent that analyzes your on-chain history on **Base** to generate unique, evolvable creatures. It's not just a game; it's an identity layer for the Agentic Web, bridging your DeFi actions with an autonomous AI companion.

![PokéTrainer Banner](https://placehold.co/1200x400/EF4444/FFFFFF?text=PokéTrainer+on+Base)

## 🏆 Hackathon Tracks & Features

### 1. Base Integration 🔵
Built entirely for the Base ecosystem.
- **Wallet Analysis:** We analyze transaction history on Base to determine your "Trainer Personality".
- **On-Chain Identity:** Your generated creature is a reflection of your on-chain behavior (DeFi degen, NFT collector, or HODLer).

### 2. AI Autonomy (Google Gemini) 🧠
We use **Google Gemini 1.5 Flash** to power the creature generation engine.
- **Dynamic Lore:** No two creatures are alike. The AI writes unique backstories based on your wallet age and activity.
- **Intelligent Typing:** The AI decides your creature's element (Fire, Water, Electric) based on your transaction volume and speed.

### 3. Real World Assets (RWA) 💎
We bridge the physical and digital worlds by detecting RWA tokens in your wallet.
- **Rock Type Unlock:** Holding tokens from **Collector Crypt** or **Beezie** automatically unlocks the rare "Rock" type for your creature.
- **Proof of Asset:** Your creature serves as a verifiable badge of your real-world holdings.

### 4. CreatorBid Integration 🚀
- **Launch Your Agent:** Every generated creature comes with a direct link to **CreatorBid**, allowing you to instantly tokenize and launch your AI agent as a tradable asset.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Pokédex Red" Theme)
- **Database:** PostgreSQL (via Prisma ORM)
- **Web3:** Wagmi v2, Viem, Alchemy SDK
- **AI:** Google Gemini Generative AI
- **Assets:** Robohash (Dynamic visual identity)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- Alchemy API Key
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanatan-dive/pokify.git
   cd pokify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_ALCHEMY_API_KEY="your_alchemy_key"
   GEMINI_API_KEY="your_gemini_key"
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 📱 How It Works

1. **Connect Wallet:** Log in with your Base wallet.
2. **Analyze:** The AI scans your transaction history and token holdings.
3. **Generate:** A unique creature is minted with stats (HP, Attack, Defense) derived from your wallet's "power".
4. **Compete:** View your creature on the global leaderboard.
5. **Launch:** Use the CreatorBid button to deploy your agent to the world.

## 🤝 Contributing

Built with ❤️ for the Pokéthon Hackathon.

---
*Gotta Mint 'Em All!*
