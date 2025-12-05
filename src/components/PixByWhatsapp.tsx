import React from "react";

type Props = {
  whatsappNumber?: string; // Ex.: "5511999998888" (DDI+DDD+numero, sem + ou espaços)
  pixKey?: string; // chave PIX exibida ao usuário
  defaultMessage?: string;
};

export const PixByWhatsapp: React.FC<Props> = ({
  whatsappNumber = "5521965106389",
  pixKey = "costaconde@gmail.com",
  defaultMessage = "Olá, enviei o comprovante do PIX referente à minha inscrição.",
}) => {
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div>
      <h3>Pagamento via PIX (envio por WhatsApp)</h3>
      <p>
        Por favor, faça o PIX para a chave: <strong>{pixKey}</strong> e depois envie o comprovante por WhatsApp.
      </p>
      <p>
        <strong>WhatsApp:</strong>{" "}
        <a href={waUrl} target="_blank" rel="noreferrer">
          {formatPhone(whatsappNumber)}
        </a>
      </p>
      <small>
        Ao enviar o comprovante por WhatsApp, inclua seu nome e e-mail usado na inscrição para que possamos identificar o pagamento.
      </small>
    </div>
  );
};

function formatPhone(num: string) {
  if (!num) return num;
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
