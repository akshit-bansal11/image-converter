import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
