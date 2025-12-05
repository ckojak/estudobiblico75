import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ShoppingCart, Flame, MessageCircle, CreditCard } from "lucide-react";
import type { BibleBook } from "@/data/biblicalBooks";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "5521965106389";

interface BookCardProps {
  book: BibleBook;
  isPurchased?: boolean;
}

export function BookCard({ book, isPurchased }: BookCardProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const discount = Math.round(((book.originalPrice - book.salePrice) / book.originalPrice) * 100);

  const getTestamentLabel = () => {
    switch (book.testament) {
      case "antigo": return "Antigo Testamento";
      case "novo": return "Novo Testamento";
      case "estudo": return "Estudo Bíblico";
      default: return "";
    }
  };

  // Função para processar o pagamento via Stripe (Checkout)
  const handleStripePurchase = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar este livro.",
      });
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      // Chama a função do Supabase que cria a sessão do Stripe
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { bookId: book.id },
      });

      if (error) throw error;

      if (data?.url) {
        // Redireciona o usuário para o checkout da Stripe
        window.location.href = data.url;
      } else {
        throw new Error("URL de pagamento não encontrada");
      }
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppUrl = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de comprar o livro "${book.title}" via Pix Manual. Por favor, me envie a chave.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <Card className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg ${book.isBestSeller ? 'ring-2 ring-orange-400/50' : ''}`}>
      {book.isBestSeller && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold">
          <Flame className="w-3 h-3 mr-1" />
          Mais Vendido
        </Badge>
      )}
      {discount > 0 && (
        <Badge className={`absolute top-3 ${book.isBestSeller ? 'right-3' : 'right-3'} z-10 bg-accent text-accent-foreground font-semibold`}>
          -{discount}%
        </Badge>
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-44 mb-4 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md">
            <img 
              src={book.coverImage} 
              alt={`Capa do livro ${book.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <Badge variant="secondary" className="mb-2 text-xs">
            {getTestamentLabel()}
          </Badge>
          
          <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
            {book.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {book.description}
          </p>
          
          {/* PREÇO ATUALIZADO AQUI */}
          <div className="flex flex-col items-center gap-0 mb-4">
            <span className="text-sm text-muted-foreground line-through">
              R$ {book.originalPrice.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-2xl font-bold text-primary">
              R$ 5,00
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              + R$ 0,93 taxa de serviço
            </span>
          </div>

          {isPurchased ? (
            <Button variant="secondary" className="w-full" asChild>
              <a href="/minhas-compras">
                <BookOpen className="w-4 h-4 mr-2" />
                Acessar E-book
              </a>
            </Button>
          ) : (
            <div className="w-full space-y-2">
              {/* BOTÃO STRIPE (Cartão/Pix Auto) */}
              <Button 
                onClick={handleStripePurchase} 
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading ? "Processando..." : "Comprar Agora (Pix/Cartão)"}
              </Button>
              
              {/* BOTÃO WHATSAPP */}
              <Button 
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                asChild
              >
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Pix via WhatsApp
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
