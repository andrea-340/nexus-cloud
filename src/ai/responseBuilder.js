export function buildResponse(result) {
  if (result.type === "files") {
    if (result.data.length === 0) return "Non ho trovato file.";

    return `Ho trovato ${result.data.length} file.`;
  }

  return result.data;
}
