import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { biblicalBooks } from "@/data/biblicalBooks";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  id: string;
  book_id: string;
  amount_paid: number;
  created_at: string;
  status: string;
}

export default function MyPurchases() {
  const { user, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadPurchases();
    }
  }, [user, authLoading, navigate]);

  const loadPurchases = async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user?.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading purchases:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas compras.",
        variant: "destructive",
      });
    } else {
      setPurchases(data || []);
    }
    setLoading(false);
  };

  const handleDownload = async (bookId: string, bookTitle: string) => {
    setDownloadingBook(bookId);
    
    try {
      const { data, error } = await supabase.functions.invoke("get-download-url", {
        body: { bookId },
      });

      if (error) {
        throw new Error(error.message || "Erro ao obter link de download");
      }

      if (data?.url) {
        // Open the signed URL in a new tab to trigger download
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `${bookTitle}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download iniciado",
          description: `O PDF de "${bookTitle}" está sendo baixado.`,
        });
      } else {
        throw new Error(data?.error || "Link de download não disponível");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Não foi possível baixar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloadingBook(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Minhas Compras
              </h1>
              <p className="text-muted-foreground">
                {purchases.length} {purchases.length === 1 ? "livro adquirido" : "livros adquiridos"}
              </p>
            </div>
          </div>

          {purchases.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-serif font-semibold mb-2">
                  Nenhuma compra ainda
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore nossa biblioteca e adquira seu primeiro e-book bíblico.
                </p>
                <Button asChild>
                  <Link to="/">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Biblioteca
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {purchases.map((purchase) => {
                const book = biblicalBooks.find((b) => b.id === purchase.book_id);
                if (!book) return null;

                return (
                  <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif font-semibold text-lg truncate">
                              {book.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {book.testament === "antigo" ? "AT" : "NT"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {book.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Comprado em {new Date(purchase.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        <Button 
                          onClick={() => handleDownload(book.id, book.title)}
                          className="flex-shrink-0"
                          disabled={downloadingBook === book.id}
                        >
                          {downloadingBook === book.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          {downloadingBook === book.id ? "Baixando..." : "Baixar PDF"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}