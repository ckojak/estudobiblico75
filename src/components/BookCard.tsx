import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ShoppingCart, Flame, MessageCircle } from "lucide-react";
import type { BibleBook } from "@/data/biblicalBooks";
import PixReceiptUpload from "./PixReceiptUpload";

const WHATSAPP_NUMBER = "5521965106389";

interface BookCardProps {
  book: BibleBook;
  isPurchased?: boolean;
}

export function BookCard({ book, isPurchased }: BookCardProps) {
  const [showPixModal, setShowPixModal] = useState(false);
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

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar este livro.",
      });
      navigate("/auth");
      return;
    }

    setShowPixModal(true);
  };

  const getWhatsAppUrl = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de comprar o livro "${book.title}" via Pix. Por favor, me envie a chave. Enviarei o comprovante em seguida para receber o link de acesso.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <>
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
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground line-through">
                R$ {book.originalPrice.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-2xl font-bold text-primary">
                R$ {book.salePrice.toFixed(2).replace(".", ",")}
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
                <Button 
                  onClick={handlePurchase} 
                  className="w-full bg-teal-500 hover:bg-teal-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar via PIX
                </Button>
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

      <PixReceiptUpload 
        open={showPixModal} 
        onOpenChange={setShowPixModal}
        preselectedBookId={book.id}
        bookTitle={book.title}
      />
    </>
  );
}
