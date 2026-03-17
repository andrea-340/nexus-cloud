import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const folders = ["fatture", "documenti", "clienti"];
    let risultati = [];

    for (const folder of folders) {
      const folderPath = path.join(process.cwd(), "data", folder);

      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, "utf8");

        if (
          content.toLowerCase().includes(message.toLowerCase()) ||
          file.toLowerCase().includes(message.toLowerCase())
        ) {
          risultati.push({
            file,
            contenuto: content.substring(0, 500),
          });
        }
      }
    }

    if (risultati.length === 0) {
      return Response.json({
        reply: "Non ho trovato documenti collegati alla tua richiesta.",
      });
    }

    let risposta = "Ho trovato questi documenti:\n\n";

    risultati.forEach((r) => {
      risposta += `📄 ${r.file}\n${r.contenuto}\n\n`;
    });

    return Response.json({
      reply: risposta,
    });
  } catch (err) {
    console.error(err);

    return Response.json({
      reply: "Errore nella ricerca dei documenti.",
    });
  }
}
