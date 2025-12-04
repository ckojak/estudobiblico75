import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { biblicalBooks } from "@/data/biblicalBooks";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Shield, Download, Flame } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadPurchasedBooks();
    }
  }, [user]);

  const loadPurchasedBooks = async () => {
    const { data } = await supabase
      .from("purchases")
      .select("book_id")
      .eq("user_id", user?.id)
      .eq("status", "completed");

    if (data) {
      setPurchasedBooks(data.map((p) => p.book_id));
    }
  };

  const bestSeller = biblicalBooks.find((b) => b.isBestSeller);
  const regularBooks = biblicalBooks.filter((b) => !b.isBestSeller);
  const antigoTestamento = regularBooks.filter((b) => b.testament === "antigo");
  const novoTestamento = regularBooks.filter((b) => b.testament === "novo");
  const estudos = regularBooks.filter((b) => b.testament === "estudo");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/80 to-background py-16 lg:py-24">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzc5NDciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyem0wLTEwdjJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Promoção Especial
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 animate-fade-in">
                E-books Bíblicos de{" "}
                <span className="text-primary">Alta Qualidade</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {biblicalBooks.length} materiais disponíveis para download imediato. 
                Fortaleça sua fé com estudos profundos da Palavra de Deus.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border/50">
                  <Shield className="w-4 h-4 text-sage" />
                  Pagamento Seguro
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border/50">
                  <Download className="w-4 h-4 text-sage" />
                  Download Instantâneo
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border/50">
                  <BookOpen className="w-4 h-4 text-sage" />
                  Formato PDF
                </div>
              </div>

              <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <span className="text-sm text-muted-foreground">Qualquer e-book por apenas</span>
                <span className="text-3xl font-bold text-accent">R$ 5,00</span>
                <span className="text-xs text-muted-foreground">+ R$ 0,93 taxa</span>
              </div>
            </div>
          </div>
        </section>

        {/* Best Seller Highlight */}
        {bestSeller && (
          <section className="container py-8">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Mais Vendido</h2>
            </div>
            <div className="max-w-sm mx-auto md:mx-0">
              <BookCard
                book={bestSeller}
                isPurchased={purchasedBooks.includes(bestSeller.id)}
              />
            </div>
          </section>
        )}

        {/* Books Section */}
        <section className="container py-12">
          <Tabs defaultValue="todos" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-4 w-full max-w-lg">
                <TabsTrigger value="todos">
                  Todos ({regularBooks.length})
                </TabsTrigger>
                <TabsTrigger value="antigo">
                  AT ({antigoTestamento.length})
                </TabsTrigger>
                <TabsTrigger value="novo">
                  NT ({novoTestamento.length})
                </TabsTrigger>
                <TabsTrigger value="estudos">
                  Estudos ({estudos.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="todos">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {regularBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <BookCard
                      book={book}
                      isPurchased={purchasedBooks.includes(book.id)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="antigo">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {antigoTestamento.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <BookCard
                      book={book}
                      isPurchased={purchasedBooks.includes(book.id)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="novo">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {novoTestamento.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <BookCard
                      book={book}
                      isPurchased={purchasedBooks.includes(book.id)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="estudos">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {estudos.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <BookCard
                      book={book}
                      isPurchased={purchasedBooks.includes(book.id)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}
