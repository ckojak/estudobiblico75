import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { biblicalBooks } from "@/data/biblicalBooks";

export default function Success() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const bookId = searchParams.get("book_id");
  const book = biblicalBooks.find((b) => b.id === bookId);

  useEffect(() => {
    if (sessionId && bookId && user) {
      verifyPayment();
    } else if (!user) {
      setError("Você precisa estar logado para verificar o pagamento.");
      setVerifying(false);
    }
  }, [sessionId, bookId, user]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId, bookId },
      });

      if (error) throw error;

      if (data?.success) {
        setVerified(true);
      } else {
        setError("Não foi possível verificar o pagamento.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Erro ao verificar pagamento. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-16">
        <div className="max-w-lg mx-auto">
          {verifying ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-2xl font-serif font-bold mb-2">
                  Verificando Pagamento...
                </h2>
                <p className="text-muted-foreground">
                  Aguarde enquanto confirmamos seu pagamento.
                </p>
              </CardContent>
            </Card>
          ) : verified ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto bg-sage/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-sage" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">
                  Pagamento Confirmado!
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Obrigado pela sua compra. O e-book "{book?.title}" já está disponível.
                </p>

                {book && (
                  <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          E-book em PDF
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/minhas-compras">
                      <Download className="w-4 h-4 mr-2" />
                      Ir para Minhas Compras
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continuar Comprando
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-destructive" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">
                  Ops! Algo deu errado
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {error || "Não foi possível processar seu pagamento."}
                </p>

                <Button asChild className="w-full">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar à Loja
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}