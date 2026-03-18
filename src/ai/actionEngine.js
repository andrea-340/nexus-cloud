import { searchFiles } from "./fileSearch";

export async function executeAction(intent, userId) {
  if (intent.action === "search_invoice") {
    const files = await searchFiles("fattura", userId);

    return {
      type: "files",
      data: files,
    };
  }

  if (intent.action === "search_photos") {
    const files = await searchFiles("foto", userId);

    return {
      type: "files",
      data: files,
    };
  }

  return {
    type: "text",
    data: "Non ho capito la richiesta.",
  };
}
