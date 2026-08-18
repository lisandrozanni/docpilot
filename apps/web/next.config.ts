import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Avoid committing auto-generated AGENTS.md/CLAUDE.md docs on every `next dev`.
  agentRules: false,
};

export default nextConfig;
