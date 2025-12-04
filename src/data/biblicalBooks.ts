export interface BibleBook {
  id: string;
  title: string;
  slug: string;
  testament: "antigo" | "novo" | "estudo";
  originalPrice: number;
  salePrice: number;
  description: string;
  coverImage: string;
}

export const biblicalBooks: BibleBook[] = [
  // Antigo Testamento
  { id: "genesis", title: "Gênesis", slug: "genesis", testament: "antigo", originalPrice: 12.90, salePrice: 5.00, description: "O livro das origens - criação, patriarcas e promessas divinas.", coverImage: "/covers/genesis.jpg" },
  { id: "proverbios", title: "Provérbios", slug: "proverbios", testament: "antigo", originalPrice: 12.90, salePrice: 5.00, description: "Sabedoria para a vida cotidiana.", coverImage: "/covers/proverbios.jpg" },
  { id: "daniel", title: "Daniel", slug: "daniel", testament: "antigo", originalPrice: 11.90, salePrice: 5.00, description: "Fé no exílio e profecias apocalípticas.", coverImage: "/covers/daniel.jpg" },
  
  // Novo Testamento
  { id: "romanos", title: "Romanos", slug: "romanos", testament: "novo", originalPrice: 12.90, salePrice: 5.00, description: "O evangelho da justiça de Deus.", coverImage: "/covers/romanos.jpg" },
  { id: "1corintios", title: "1 Coríntios", slug: "1-corintios", testament: "novo", originalPrice: 12.90, salePrice: 5.00, description: "Unidade e dons na igreja.", coverImage: "/covers/1-corintios.jpg" },
  { id: "2corintios", title: "2 Coríntios", slug: "2-corintios", testament: "novo", originalPrice: 11.90, salePrice: 5.00, description: "O ministério apostólico.", coverImage: "/covers/2-corintios.jpg" },
  { id: "galatas", title: "Gálatas", slug: "galatas", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "Liberdade em Cristo.", coverImage: "/covers/galatas.jpg" },
  { id: "efesios", title: "Efésios", slug: "efesios", testament: "novo", originalPrice: 10.90, salePrice: 5.00, description: "A igreja, corpo de Cristo.", coverImage: "/covers/efesios.jpg" },
  { id: "filipenses", title: "Filipenses", slug: "filipenses", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "Alegria em todas as circunstâncias.", coverImage: "/covers/filipenses.jpg" },
  { id: "colossenses", title: "Colossenses", slug: "colossenses", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "A supremacia de Cristo.", coverImage: "/covers/colossenses.jpg" },
  { id: "1tessalonicenses", title: "1 Tessalonicenses", slug: "1-tessalonicenses", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "A vinda do Senhor.", coverImage: "/covers/1-tessalonicenses.jpg" },
  { id: "2tessalonicenses", title: "2 Tessalonicenses", slug: "2-tessalonicenses", testament: "novo", originalPrice: 8.90, salePrice: 5.00, description: "O dia do Senhor.", coverImage: "/covers/2-tessalonicenses.jpg" },
  { id: "1timoteo", title: "1 Timóteo", slug: "1-timoteo", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "Instruções para líderes.", coverImage: "/covers/1-timoteo.jpg" },
  { id: "2timoteo", title: "2 Timóteo", slug: "2-timoteo", testament: "novo", originalPrice: 9.90, salePrice: 5.00, description: "Perseverança na fé.", coverImage: "/covers/2-timoteo.jpg" },
  { id: "filemom", title: "Filemom", slug: "filemom", testament: "novo", originalPrice: 7.90, salePrice: 5.00, description: "Reconciliação e perdão.", coverImage: "/covers/filemon.jpg" },
  
  // Estudos Especiais
  { id: "milagres-jesus", title: "Os Milagres de Jesus", slug: "milagres-jesus", testament: "estudo", originalPrice: 14.90, salePrice: 5.00, description: "Um estudo profundo sobre os milagres realizados por Jesus.", coverImage: "/covers/milagres-jesus.jpg" },
  { id: "ministerio-jesus", title: "O Ministério de Jesus", slug: "ministerio-jesus", testament: "estudo", originalPrice: 14.90, salePrice: 5.00, description: "Explore a vida e o ministério terreno de Jesus Cristo.", coverImage: "/covers/ministerio-jesus.jpg" },
  { id: "biografia-paulo", title: "Biografia de Paulo", slug: "biografia-paulo", testament: "estudo", originalPrice: 14.90, salePrice: 5.00, description: "A fascinante jornada do apóstolo Paulo.", coverImage: "/covers/biografia-paulo.jpg" },
  { id: "oracao-pai-nosso", title: "A Oração do Pai Nosso", slug: "oracao-pai-nosso", testament: "estudo", originalPrice: 12.90, salePrice: 5.00, description: "Um estudo teológico profundo sobre a oração modelo.", coverImage: "/covers/oracao-pai-nosso.jpg" },
];
