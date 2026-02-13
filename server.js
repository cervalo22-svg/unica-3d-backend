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

// Rota de teste
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

    // 👉 Usar a PRIMEIRA foto como referência principal
    const fotoReferencia = fotos[0];

    // Converter imagem para base64
    const imageBase64Input = fs.readFileSync(fotoReferencia.path, {
      encoding: "base64",
    });

    // 🔒 PROMPT MANTIDO EXATAMENTE COMO VOCÊ CRIOU
    const prompt = `
Um personagem chibi 3D estilizado, com cabeça grande e corpo pequeno, em estilo semirrealista. Reproduzir exatamente a pose da foto de referência. Manter os traços principais do rosto fiéis ao original, com um sorriso suave, olhos grandes e arredondados, e cabelo com aparência natural. Acabamento limpo e esculpido, com texturas detalhadas nos cabelos, roupas e acessórios. A figura deve estar sobre uma base lisa e plana, adequada para impressão em resina. Fundo neutro, iluminação suave, ângulo frontal levemente inclinado para valorizar o volume da cabeça e os detalhes da escultura.

Detalhes solicitados pelo cliente:
${observacao}
`;

    // 🔥 CHAMADA CORRETA: TEXTO + IMAGEM
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64Input}`,
            },
          ],
        },
      ],
    });

    // Extrair imagem gerada
    const imageOutput = response.output
      .flatMap((o) => o.content)
      .find((c) => c.type === "output_image");

    if (!imageOutput || !imageOutput.image_base64) {
      throw new Error("IA não retornou imagem.");
    }

    const finalImageBase64 = imageOutput.image_base64;

    // Limpar uploads temporários
    fotos.forEach((file) => fs.unlinkSync(file.path));

    // Retornar para o frontend
    res.json({
      success: true,
      imageBase64: finalImageBase64,
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
