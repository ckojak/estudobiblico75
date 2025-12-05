import React from "react";
import PixByWhatsapp from "./PixByWhatsapp";

const PaymentMethods: React.FC = () => {
  return (
    <div>
      <h2>Formas de pagamento</h2>
      <section>
        <h3>PIX</h3>
        <PixByWhatsapp />
      </section>
      <section>
        <h3>Outros métodos</h3>
        <p>Cartão e boleto seguem disponíveis conforme sua integração atual.</p>
      </section>
    </div>
  );
};

export default PaymentMethods;
