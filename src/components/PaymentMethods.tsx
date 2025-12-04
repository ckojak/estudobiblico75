import { CreditCard, Smartphone, Wallet } from "lucide-react";

const PaymentMethods = () => {
  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-lg font-semibold text-foreground mb-6">
          Formas de Pagamento Aceitas
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {/* Credit/Debit Cards */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <CreditCard className="w-8 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Cartão de Crédito</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <CreditCard className="w-8 h-5 text-emerald-600" />
            </div>
            <span className="text-xs text-muted-foreground">Cartão de Débito</span>
          </div>

          {/* PIX */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <svg className="w-8 h-5" viewBox="0 0 512 512" fill="none">
                <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z" fill="#32BCAD"/>
                <path d="M112.57 119.896h38.297c7.97 0 15.98 3.027 22.022 9.088l76.711 76.693c14.21 14.21 37.279 14.192 51.489-.02l76.97-76.97c6.06-6.042 14.052-9.069 22.003-9.069h38.297L359.37 40.607c-30.326-30.326-79.505-30.326-109.849 0L112.57 119.896zm317.789 271.294h-38.278c-7.97 0-15.943-3.027-22.003-9.07l-76.989-76.988c-6.943-6.943-16.071-10.414-25.2-10.414-9.109 0-18.237 3.471-25.18 10.414l-76.693 76.692c-6.042 6.042-14.052 9.088-22.022 9.088h-38.297l136.97 136.97c30.344 30.326 79.523 30.326 109.849 0l78.843-136.692z" fill="#32BCAD"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">PIX</span>
          </div>

          {/* Google Pay */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <svg className="w-10 h-5" viewBox="0 0 435.97 173.13">
                <path fill="#5F6368" d="M207.2 84.56v50.67h-16.1V8.46h42.7a38.61 38.61 0 0 1 27.32 10.64 34.47 34.47 0 0 1 11.26 26.26 34.24 34.24 0 0 1-11.26 26.45 38.94 38.94 0 0 1-27.32 10.58H207.2v2.17zm0-60.33v44.56h26.9a21.46 21.46 0 0 0 16.14-6.81 22.62 22.62 0 0 0 .18-31.6 21.22 21.22 0 0 0-16.32-6.96h-26.9v.81z"/>
                <path fill="#4285F4" d="M309.1 46.99c11.88 0 21.24 3.18 28.08 9.54 6.84 6.36 10.26 15.07 10.26 26.13v52.57h-15.38v-11.83h-.72c-6.64 9.74-15.48 14.61-26.52 14.61a36.25 36.25 0 0 1-24.9-9.1 29.09 29.09 0 0 1-10.17-22.51c0-9.51 3.59-17.09 10.76-22.71 7.17-5.63 16.74-8.44 28.71-8.44 10.22 0 18.65 1.87 25.29 5.62v-3.94c0-5.95-2.38-11-7.13-15.15a24.1 24.1 0 0 0-16.52-6.21c-9.55 0-17.11 4.04-22.68 12.12l-14.17-8.93c8.33-11.93 20.72-17.89 37.17-17.89l-.08.12zm-22 62.78a14.5 14.5 0 0 0 5.96 11.87 21.55 21.55 0 0 0 13.79 4.75 27.34 27.34 0 0 0 19.28-8.06c5.64-5.37 8.47-11.69 8.47-18.96-5.38-4.33-12.87-6.49-22.48-6.49-7 0-12.85 1.72-17.55 5.15-4.61 3.44-7.47 7.62-7.47 11.74z"/>
                <path fill="#34A853" d="M436 49.77l-53.38 122.84h-16.68l19.82-43.27-35.12-79.57h17.58l25.01 60.15h.36l24.35-60.15H436z"/>
                <path fill="#4285F4" d="M142.06 74.47a52.24 52.24 0 0 0-.72-8.62H72.58v16.29h39a33.35 33.35 0 0 1-14.48 21.9v18.2h23.44c13.72-12.63 21.63-31.24 21.63-47.77h-.11z"/>
                <path fill="#34A853" d="M72.58 139.63c19.58 0 36.01-6.49 48.02-17.58l-23.44-18.2c-6.49 4.35-14.8 6.92-24.58 6.92-18.9 0-34.92-12.76-40.63-29.93H7.67v18.78a72.47 72.47 0 0 0 64.91 40.01z"/>
                <path fill="#FBBC04" d="M31.95 80.84a43.54 43.54 0 0 1 0-27.68V34.38H7.67a72.62 72.62 0 0 0 0 65.24l24.28-18.78z"/>
                <path fill="#EA4335" d="M72.58 23.23a39.24 39.24 0 0 1 27.76 10.85l20.81-20.81A69.78 69.78 0 0 0 72.58 0 72.47 72.47 0 0 0 7.67 34.38l24.28 18.78c5.71-17.17 21.73-29.93 40.63-29.93z"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Google Pay</span>
          </div>

          {/* Apple Pay */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <svg className="w-10 h-5" viewBox="0 0 165.52 105.97">
                <path d="M150.7 0H14.82A14.83 14.83 0 0 0 0 14.82v76.33a14.83 14.83 0 0 0 14.82 14.82H150.7a14.83 14.83 0 0 0 14.82-14.82V14.82A14.83 14.83 0 0 0 150.7 0z" fill="#000"/>
                <path d="M43.08 35.19a8.14 8.14 0 0 0 1.86-5.83 8.29 8.29 0 0 0-5.41 2.8 7.76 7.76 0 0 0-1.91 5.64 6.87 6.87 0 0 0 5.46-2.61zM44.91 38.14c-3 0-5.49 1.72-6.91 1.72s-3.59-1.63-5.93-1.59a8.76 8.76 0 0 0-7.44 4.51c-3.18 5.5-.83 13.65 2.26 18.13 1.51 2.2 3.32 4.64 5.7 4.55 2.28-.09 3.14-1.47 5.89-1.47s3.53 1.47 5.94 1.42c2.46 0 4-2.21 5.51-4.42a19.35 19.35 0 0 0 2.49-5.1 8 8 0 0 1-4.8-7.32 8.12 8.12 0 0 1 3.87-6.82 8.32 8.32 0 0 0-6.58-3.57zM71.2 31.14c6.29 0 10.68 4.34 10.68 10.65S77.4 52.48 71 52.48h-7v11.14h-5V31.14zm-7.24 17h5.81c4.38 0 6.87-2.36 6.87-6.31s-2.49-6.3-6.85-6.3h-5.83zM83.77 56c0-4.82 3.7-7.79 10.26-8.17l7.55-.44v-2.13c0-3.07-2.06-4.9-5.5-4.9-3.26 0-5.3 1.62-5.79 4.11h-4.57c.31-4.69 4.22-8.15 10.52-8.15 6.18 0 10.12 3.26 10.12 8.37v17.52h-4.63v-4.19h-.1a9.17 9.17 0 0 1-8.18 4.59c-5.08 0-9.68-3.11-9.68-6.61zm17.81-2.38v-2.17l-6.79.42c-3.4.22-5.33 1.74-5.33 4.19s2 4 4.84 4c3.7 0 7.28-2.51 7.28-6.44zM111.72 73.89v-4a22.64 22.64 0 0 0 2.35.14c2.35 0 3.64-1 4.43-3.53l.48-1.55-9.59-28.54h5.24l7.08 23.26h.1l7.08-23.26h5.11l-9.95 29.86c-2.27 6.84-4.9 9-10.4 9a14.82 14.82 0 0 1-1.93-.38z" fill="#fff"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Apple Pay</span>
          </div>

          {/* Mastercard */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <svg className="w-8 h-5" viewBox="0 0 152.407 108">
                <rect width="152.407" height="108" fill="none"/>
                <circle cx="60.412" cy="54" r="48" fill="#EB001B"/>
                <circle cx="91.995" cy="54" r="48" fill="#F79E1B"/>
                <path d="M76.2,18.13A48,48,0,0,0,60.41,54a48,48,0,0,0,15.79,35.87A48,48,0,0,0,92,54,48,48,0,0,0,76.2,18.13Z" fill="#FF5F00"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Mastercard</span>
          </div>

          {/* Visa */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-10 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border">
              <svg className="w-10 h-4" viewBox="0 0 1000 324.68">
                <path d="M651.19 0.5c-70.93 0-134.32 36.77-134.32 104.69 0 77.9 112.42 83.28 112.42 122.42 0 16.48-18.88 31.23-51.14 31.23-45.77 0-79.98-20.61-79.98-20.61l-14.64 68.55s39.41 17.41 91.73 17.41c77.55 0 138.58-38.57 138.58-107.66 0-82.32-113.04-87.6-113.04-123.79 0-12.91 15.82-27.05 48.51-27.05 36.21 0 65.67 14.98 65.67 14.98l14.23-66.1S694.57 0.5 651.19 0.5zM2.22 5.49L0 17.01s30.05 5.48 57.11 16.32c34.85 13.05 37.36 20.65 43.2 43.36L156.76 319h85.42L379.93 5.49h-85.05l-96.05 213.17-39.62-180.7C154.51 15.57 137.72 5.49 112.62 5.49H2.22zM415.05 5.49L348.59 319h81.16l66.2-313.51h-81zM746.8 5.49c-24.79 0-37.95 13.21-47.59 36.35L576.71 319h85.05l16.71-46.29h104.01L793.02 319h75.01L800.67 5.49H746.8zm10.2 86.1l25.18 120.02h-67.34l42.16-120.02z" fill="#1434CB"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Visa</span>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          Pagamentos processados de forma segura via Stripe
        </p>
      </div>
    </section>
  );
};

export default PaymentMethods;
