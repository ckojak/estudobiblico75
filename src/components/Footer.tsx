import { BookOpen, Shield, CreditCard, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-serif font-semibold">Biblioteca Sagrada</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Sua fonte confiável de e-books bíblicos. Todos os 66 livros da Bíblia 
              disponíveis em formato digital para sua edificação espiritual.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Garantias</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-sage" />
                Pagamento Seguro
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-sage" />
                Download Imediato
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@bibliotecasagrada.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Biblioteca Sagrada. Todos os direitos reservados.</p>
          <p className="mt-2">Processamento de pagamentos por Stripe</p>
        </div>
      </div>
    </footer>
  );
}