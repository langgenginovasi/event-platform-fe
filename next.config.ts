import type { NextConfig } from "next";
import path from "path";

console.log("[BUILD-TIME ENV] NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL ?? "❌ UNDEFINED");
console.log("[BUILD-TIME ENV] NEXTAUTH_URL        =", process.env.NEXTAUTH_URL ?? "❌ UNDEFINED");
console.log("[BUILD-TIME ENV] NEXTAUTH_SECRET     =", process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ UNDEFINED");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
