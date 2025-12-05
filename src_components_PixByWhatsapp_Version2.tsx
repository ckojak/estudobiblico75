import React from "react";

type Props = {
  whatsappNumber?: string; // Ex.: "5511999998888" (DDI + DDD + número, sem + ou espaços)
  defaultMessage?: string;
};

export const PixByWhatsapp: React.FC<Props> = ({
  whatsappNumber = "5511999998888",
  defaultMessage = "Olá, enviei o comprovante do PIX referente à minha inscrição.",
}) => {
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div>
      <h3>Pagamento via PIX (envio por WhatsApp)</h3>
      <p>
        Por favor, faça o PIX para a chave: <strong>COLOQUE_A_CHAVE_AQUI</strong> e depois envie o comprovante por WhatsApp.
      </p>
      <p>
        <strong>WhatsApp:</strong>{" "}
        <a href={waUrl} target="_blank" rel="noreferrer">
          {formatPhone(whatsappNumber)}
        </a>
      </p>
      <small>
        Ao enviar o comprovante por WhatsApp, indique seu nome e/ou e-mail usado na inscrição.
      </small>
    </div>
  );
};

function formatPhone(num: string) {
  if (!num) return num;
  // Formatação simples opcional: +55 11 99999-8888
  if (num.length >= 11) {
    const ddi = num.slice(0, 2);
    const ddd = num.slice(2, 4);
    const rest = num.slice(4);
    if (rest.length === 9) {
      return `+${ddi} ${ddd} ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
    return `+${ddi} ${ddd} ${rest}`;
  }
  return num;
}

export default PixByWhatsapp;