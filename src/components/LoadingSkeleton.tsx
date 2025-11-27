import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="h-8 bg-primary/10 rounded-md animate-pulse w-3/4 mx-auto" />
        <div className="h-4 bg-primary/5 rounded-md animate-pulse w-1/2 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Placeholder */}
        <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 animate-pulse flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-4xl opacity-20"
          >
            🧬
          </motion.div>
        </div>

        {/* Stats Placeholder */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-primary/5 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Bar Stats Placeholder */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 h-4 bg-primary/5 rounded animate-pulse" />
              <div className="flex-1 h-2 bg-primary/5 rounded-full animate-pulse" />
              <div className="w-8 h-4 bg-primary/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
