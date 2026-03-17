import fs from "fs";
import path from "path";

export function readFiles(folder) {
  const folderPath = path.join(process.cwd(), "data", folder);

  if (!fs.existsSync(folderPath)) return [];

  const files = fs.readdirSync(folderPath);

  const contents = files.map((file) => {
    const filePath = path.join(folderPath, file);

    const text = fs.readFileSync(filePath, "utf8");

    return {
      name: file,
      text: text,
    };
  });

  return contents;
}
