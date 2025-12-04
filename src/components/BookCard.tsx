import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ShoppingCart, Loader2, Flame } from "lucide-react";
import type { BibleBook } from "@/data/biblicalBooks";

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

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar este livro.",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          bookId: book.id,
          bookTitle: book.title,
          amount: book.salePrice,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg ${book.isBestSeller ? 'ring-2 ring-accent shadow-lg' : ''}`}>
      {book.isBestSeller && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold animate-pulse">
          <Flame className="w-3 h-3 mr-1" />
          Mais Vendido
        </Badge>
      )}
      {discount > 0 && (
        <Badge className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground font-semibold">
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
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground line-through">
              R$ {book.originalPrice.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-2xl font-bold text-primary">
              R$ {book.salePrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            + R$ 0,93 taxa de serviço
          </p>

          {isPurchased ? (
            <Button variant="secondary" className="w-full" asChild>
              <a href="/minhas-compras">
                <BookOpen className="w-4 h-4 mr-2" />
                Acessar E-book
              </a>
            </Button>
          ) : (
            <Button 
              onClick={handlePurchase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {loading ? "Processando..." : "Comprar Agora"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
