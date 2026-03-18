import { readFiles } from "./readFiles";

export function searchFiles(query) {
  const folders = ["fatture", "documenti", "clienti"];

  let results = [];

  folders.forEach((folder) => {
    const files = readFiles(folder);

    files.forEach((file) => {
      if (file.text.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          folder,
          name: file.name,
          text: file.text,
        });
      }
    });
  });

  return results;
}
