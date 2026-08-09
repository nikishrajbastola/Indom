import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multiple parent lockfiles can make Next infer an overly broad workspace.
  // Keep Turbopack scoped to this application.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
