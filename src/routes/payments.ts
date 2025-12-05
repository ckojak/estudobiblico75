import { Router, Request, Response } from "express";

const router = Router();

/**
 * Endpoint simplificado para registrar pagamento via PIX com envio de comprovante por WhatsApp.
 * Não aceita arquivos. Ajuste para integrar ao seu serviço/ORM.
 */
router.post("/payments/pix", async (req: Request, res: Response) => {
  try {
    const { userId, amount, viaWhatsapp } = req.body;
    // TODO: integrar com paymentsService/DB para registrar a intenção de pagamento
    // Exemplo: await paymentsService.create({ userId, amount, method: 'pix-whatsapp', viaWhatsapp: !!viaWhatsapp });

    return res.status(201).json({ message: "Pagamento registrado (aguardando comprovante por WhatsApp)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
