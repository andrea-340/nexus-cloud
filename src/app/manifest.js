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
        src: "/window.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}

