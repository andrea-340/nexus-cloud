export function parseIntent(text) {
  const t = text.toLowerCase();

  if (t.includes("fattura")) return { action: "search_invoice" };

  if (t.includes("busta paga")) return { action: "search_salary" };

  if (t.includes("foto")) return { action: "search_photos" };

  if (t.includes("video")) return { action: "search_videos" };

  if (t.includes("quanto ho fatturato")) return { action: "calculate_revenue" };

  return { action: "generic" };
}
