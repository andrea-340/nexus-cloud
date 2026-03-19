export default function manifest() {
  return {
    name: "Nexus Cloud",
    short_name: "Nexus",
    description: "Nexus Cloud",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#1a73e8",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48 64x64 128x128 192x192 256x256",
        type: "image/x-icon",
        purpose: "any maskable",
      },
    ],
  };
}
