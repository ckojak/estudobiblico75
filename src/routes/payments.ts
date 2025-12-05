import { Router, Request, Response } from "express";

const router = Router();

/**
 * Endpoint simplificado para registrar pagamento via PIX com envio de comprovante por WhatsApp.
 * Remove o upload direto de arquivos do servidor.
 */
router.post("/payments/pix", async (req: Request, res: Response) => {
  try {
    const { userId, amount, viaWhatsapp } = req.body;
    // Exemplo: salvar apenas a intenção/registro (implemente conforme seu service/ORM)
    // await paymentsService.create({ userId, amount, method: 'pix-whatsapp', viaWhatsapp });

    return res.status(201).json({ message: "Pagamento registrado (aguardando comprovante por WhatsApp)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;