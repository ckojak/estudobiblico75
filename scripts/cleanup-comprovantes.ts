import fs from "fs";
import path from "path";

// Este script remove arquivos de comprovantes em uploads/comprovantes.
// NÃO executa automaticamente. Execute localmente no servidor onde os arquivos estejam.

const UPLOADS_DIR = path.resolve(__dirname, "../uploads/comprovantes"); // ajuste se necessário

async function cleanup() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("Diretório de uploads não encontrado:", UPLOADS_DIR);
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    try {
      fs.unlinkSync(filePath);
      console.log("Removido:", filePath);
    } catch (err) {
      console.error("Erro removendo", filePath, err);
    }
  }
  console.log("Limpeza concluída.");
}

cleanup().catch((e) => {
  console.error(e);
  process.exit(1);
});