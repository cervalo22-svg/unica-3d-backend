import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Upload temporário
const upload = multer({ dest: "uploads/" });

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota de teste (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("Backend Única 3D rodando com sucesso 🚀");
});

// Rota principal
app.post("/upload", upload.array("fotos", 5), async (req, res) => {
  try {
    const { nome, telefone, email, instagram, observacao } = req.body;
    const fotos = req.files;

    if (!fotos || fotos.length === 0) {
      return res.status(400).json({ error: "Nenhuma foto enviada." });
    }

    const prompt = `
Um personagem chibi 3D estilizado, com cabeça grande e corpo pequeno, em estilo semirrealista. Reproduzir exatamente a pose da foto de referência. Manter os traços principais do rosto fiéis ao original, com um sorriso suave, olhos grandes e arredondados, e cabelo com aparência natural. Acabamento limpo e esculpido, com texturas detalhadas nos cabelos, roupas e acessórios. A figura deve estar sobre uma base lisa e plana, adequada para impressão em resina. Fundo neutro, iluminação suave, ângulo frontal levemente inclinado para valorizar o volume da cabeça e os detalhes da escultura.

Detalhes solicitados pelo cliente:
${observacao}


    `;



    // Enviar para a IA
   // Enviar para a IA
const result = await openai.images.generate({
  model: "gpt-image-1",
  prompt: prompt,
  size: "1024x1024",
});

// Pegar a imagem em base64
const imageBase64 = result.data[0].b64_json;

// Limpar uploads temporários
fotos.forEach((file) => fs.unlinkSync(file.path));

// Retornar direto para o site
res.json({
  success: true,
  imageBase64: imageBase64
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar imagens." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log("Servidor rodando 🚀");
  console.log("PORT:", port);
  console.log(
    "OPENAI_API_KEY existe?",
    Boolean(process.env.OPENAI_API_KEY)
  );
});
