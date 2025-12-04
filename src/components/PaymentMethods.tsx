import { Shield, Lock, Copy, Check, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import pixQrCode from "@/assets/pix-qrcode.jpeg";
import PixReceiptUpload from "./PixReceiptUpload";

const PIX_CODE = "00020126580014BR.GOV.BCB.PIX01368b362a40-2c30-4453-921c-d318db20116852040000530398654045.935802BR5924Carlos Henrique da Costa6009SAO PAULO62140510zdxnN49Kap6304A896";

const PaymentMethods = () => {
  const [copied, setCopied] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Erro ao copiar código");
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-muted/50 to-muted/80 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-teal-500" />
          <h3 className="text-center text-sm font-medium text-teal-600 uppercase tracking-wider">
            Pagamento 100% Seguro
          </h3>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Pagamento exclusivo via PIX - Aprovação rápida!
        </p>

        <div className="max-w-2xl mx-auto">
          {/* PIX Section */}
          <div className="p-6 bg-card rounded-2xl border border-teal-500/30 shadow-lg shadow-teal-500/5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none">
                <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z" fill="#32BCAD"/>
                <path d="M112.57 119.896h38.297c7.97 0 15.98 3.027 22.022 9.088l76.711 76.693c14.21 14.21 37.279 14.192 51.489-.02l76.97-76.97c6.06-6.042 14.052-9.069 22.003-9.069h38.297L359.37 40.607c-30.326-30.326-79.505-30.326-109.849 0L112.57 119.896zm317.789 271.294h-38.278c-7.97 0-15.943-3.027-22.003-9.07l-76.989-76.988c-6.943-6.943-16.071-10.414-25.2-10.414-9.109 0-18.237 3.471-25.18 10.414l-76.693 76.692c-6.042 6.042-14.052 9.088-22.022 9.088h-38.297l136.97 136.97c30.344 30.326 79.523 30.326 109.849 0l78.843-136.692z" fill="#32BCAD"/>
              </svg>
              <h4 className="text-lg font-semibold text-foreground">Pague com PIX</h4>
              <span className="ml-auto text-xs bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-full font-medium">
                Aprovação Rápida
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <img 
                    src={pixQrCode} 
                    alt="QR Code PIX" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
              </div>
              
              {/* PIX Code */}
              <div className="flex-1 w-full">
                <p className="text-sm text-muted-foreground mb-2">
                  Escaneie o QR Code ou copie o código abaixo:
                </p>
                <div className="relative">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50 font-mono text-xs break-all text-muted-foreground max-h-20 overflow-y-auto">
                    {PIX_CODE}
                  </div>
                  <button
                    onClick={handleCopyPix}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Código PIX
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-3">
                    Após o pagamento, envie o comprovante para liberar seu e-book:
                  </p>
                  <button
                    onClick={() => setShowReceiptUpload(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg font-medium transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    Enviar Comprovante
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-teal-500/5 rounded-xl border border-teal-500/10">
              <h5 className="text-sm font-medium text-foreground mb-2">Como funciona:</h5>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Escolha o e-book desejado e clique em "Comprar via PIX"</li>
                <li>Faça o pagamento usando o QR Code ou código PIX acima</li>
                <li>Envie o comprovante de pagamento</li>
                <li>Receba acesso ao e-book após a aprovação</li>
              </ol>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-6 pt-6 mt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-teal-500" />
              <span className="text-xs">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-xs">Dados Protegidos</span>
            </div>
          </div>
        </div>
      </div>

      <PixReceiptUpload 
        open={showReceiptUpload} 
        onOpenChange={setShowReceiptUpload}
      />
    </section>
  );
};

export default PaymentMethods;
