/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Client router cache: revisiting a tab within 30s reuses the last render
    // instead of a full server round-trip (middleware auth + Supabase queries).
    // Safe with mutations — every server action calls revalidatePath, which
    // purges these entries immediately.
    staleTimes: { dynamic: 30 },
  },
};

module.exports = nextConfig;
