import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import PaymentMethods from "@/components/PaymentMethods";
import { biblicalBooks } from "@/data/biblicalBooks";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Shield, Download, Quote } from "lucide-react";

const versiculos = [
  { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", referencia: "João 3:16" },
  { texto: "O Senhor é o meu pastor; nada me faltará.", referencia: "Salmos 23:1" },
  { texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13" },
  { texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", referencia: "Provérbios 3:5" },
  { texto: "Porque eu sei os planos que tenho para vocês, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", referencia: "Jeremias 29:11" },
  { texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", referencia: "Isaías 41:10" },
  { texto: "E conhecereis a verdade, e a verdade vos libertará.", referencia: "João 8:32" },
  { texto: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", referencia: "1 Coríntios 13:4" },
  { texto: "Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.", referencia: "Mateus 6:33" },
  { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", referencia: "Salmos 37:5" },
  { texto: "Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus.", referencia: "Mateus 5:9" },
  { texto: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!", referencia: "Filipenses 4:4" },
  { texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", referencia: "Mateus 11:28" },
  { texto: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim.", referencia: "João 14:6" },
  { texto: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus.", referencia: "Efésios 2:8" },
  { texto: "Sede fortes e corajosos, não temais, nem vos atemorizeis; porque o Senhor, vosso Deus, é convosco.", referencia: "Deuteronômio 31:6" },
  { texto: "A tua palavra é lâmpada para os meus pés e luz para o meu caminho.", referencia: "Salmos 119:105" },
  { texto: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", referencia: "Isaías 40:31" },
  { texto: "Não se turbe o vosso coração; credes em Deus, crede também em mim.", referencia: "João 14:1" },
  { texto: "Pois onde estiver o vosso tesouro, aí estará também o vosso coração.", referencia: "Mateus 6:21" },
];

export default function Index() {
  const { user } = useAuth();
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);

  // Gera um versículo aleatório a cada renderização
  const versiculoDoDia = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * versiculos.length);
    return versiculos[randomIndex];
  }, []);

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

  const antigoTestamento = biblicalBooks.filter((b) => b.testament === "antigo");
  const novoTestamento = biblicalBooks.filter((b) => b.testament === "novo");
  const estudos = biblicalBooks.filter((b) => b.testament === "estudo");

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

              <div className="inline-flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl px-6 py-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <span className="text-sm text-muted-foreground">Qualquer e-book por apenas</span>
                <span className="text-3xl font-bold text-teal-600">R$ 5,00</span>
                <span className="text-xs text-muted-foreground">via PIX</span>
              </div>
            </div>
          </div>
        </section>

        {/* Versículo do Dia */}
        <section className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Quote className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Versículo do Dia</span>
            </div>
            <blockquote className="text-lg md:text-xl text-foreground/80 italic font-serif leading-relaxed">
              "{versiculoDoDia.texto}"
            </blockquote>
            <cite className="block mt-3 text-sm text-muted-foreground not-italic font-medium">
              — {versiculoDoDia.referencia}
            </cite>
          </div>
        </section>

        {/* Books Section */}
        <section className="container py-12">
          <Tabs defaultValue="todos" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-4 w-full max-w-lg">
                <TabsTrigger value="todos">
                  Todos ({biblicalBooks.length})
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
                {biblicalBooks.map((book, index) => (
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

      <PaymentMethods />
      <Footer />
    </div>
  );
}
