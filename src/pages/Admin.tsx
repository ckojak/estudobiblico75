import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// MUDANÇA: Use useAuth para pegar 'userRole' e 'signOut'
import { useAuth } from "@/contexts/AuthContext"; 
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, ShoppingCart, TrendingUp, Users, Receipt, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { biblicalBooks } from "@/data/biblicalBooks";
import { AdminBookManager } from "@/components/AdminBookManager";
import { AdminPixReceipts } from "@/components/AdminPixReceipts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// IMPORTAÇÃO NOVA: Componente de gerenciamento de usuários
import { AdminUserManager } from "@/components/AdminUserManager"; 


interface PurchaseData {
  id: string;
  book_id: string;
  amount_paid: number;
  service_fee: number;
  created_at: string;
  user_id: string;
}

interface DailyStats {
  date: string;
  sales: number;
  revenue: number;
}

interface BookStats {
  name: string;
  sales: number;
  revenue: number;
}

export default function Admin() {
  // MUDANÇA: Pega userRole diretamente do contexto
  const { user, userRole, loading: authLoading, signOut } = useAuth(); 
  
  // Removido o estado 'isAdmin' e 'checkingRole' pois usaremos 'userRole'
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isAdmin = userRole === 'admin'; // Nova verificação mais simples

  useEffect(() => {
    // Se o auth terminar de carregar e não houver usuário, redireciona para login
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    } 
    
    // Se o usuário está logado, mas não é admin, nega acesso e redireciona
    if (!authLoading && user && userRole !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão de administrador.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Se for admin, carrega as compras
    if (userRole === 'admin') {
      loadPurchases();
    }
    
    // Limpeza do código antigo: a função checkAdminRole não é mais necessária

  }, [user, userRole, authLoading, navigate]); // Adiciona userRole como dependência

  // Removida a função checkAdminRole

  const loadPurchases = async () => {
    // ... (Resto da função loadPurchases permanece o mesmo)
    
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading purchases:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } else {
      setPurchases(data || []);
    }
    setLoading(false);
  };

  // Calcula o loading da tela inicial de forma simplificada
  if (authLoading || (user && userRole === null)) { // Espera o userRole carregar
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

  if (!isAdmin) {
    // Se não for admin e não estiver mais carregando, retorna nulo (já foi redirecionado)
    return null; 
  }
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  // ... (O restante do código de cálculo e charts permanece o mesmo)

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalServiceFees = purchases.reduce((sum, p) => sum + p.service_fee, 0);
  const netRevenue = totalRevenue - totalServiceFees;
  const totalSales = purchases.length;
  const uniqueCustomers = new Set(purchases.map((p) => p.user_id)).size;

  const getDailyStats = (): DailyStats[] => {
    const last30Days: DailyStats[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayPurchases = purchases.filter(
        (p) => p.created_at.split("T")[0] === dateStr
      );

      last30Days.push({
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        sales: dayPurchases.length,
        revenue: dayPurchases.reduce((sum, p) => sum + p.amount_paid, 0),
      });
    }

    return last30Days;
  };

  // Book sales data
  const getBookStats = (): BookStats[] => {
    const bookMap = new Map<string, { sales: number; revenue: number }>();

    purchases.forEach((p) => {
      const current = bookMap.get(p.book_id) || { sales: 0, revenue: 0 };
      bookMap.set(p.book_id, {
        sales: current.sales + 1,
        revenue: current.revenue + p.amount_paid,
      });
    });

    return Array.from(bookMap.entries())
      .map(([bookId, stats]) => {
        const book = biblicalBooks.find((b) => b.id === bookId);
        return {
          name: book?.title || bookId,
          sales: stats.sales,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  };

  const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#84CC16"];

  const dailyStats = getDailyStats();
  const bookStats = getBookStats();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie livros, vendas e métricas
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Comprovantes PIX
            </TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="books">Gerenciar Livros</TabsTrigger>
          </TabsList>
          
          {/* NOVA ABA DE USUÁRIOS */}
          <TabsContent value="users">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="pix">
            <AdminPixReceipts />
          </TabsContent>

          <TabsContent value="books">
            <AdminBookManager />
          </TabsContent>

          <TabsContent value="analytics">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* ... (Seu código dos cards de estatísticas continua aqui) */}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* ... (Seu código dos gráficos continua aqui) */}
              </div>

              {/* Recent Purchases Table */}
              <Card className="mt-6">
                {/* ... (Sua tabela de compras recentes continua aqui) */}
              </Card>
            
            {/* Seu código de análise original */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Líquido: R$ {netRevenue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vendas Totais
                  </CardTitle>
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    e-books vendidos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    por compra
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Clientes Únicos
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    compradores
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita Diária (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Receita"]}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Diárias (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value: number) => [value, "Vendas"]}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Book Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Books Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Livros Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {bookStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{ fontSize: 11 }}
                            width={120}
                          />
                          <Tooltip 
                            formatter={(value: number) => [value, "Vendas"]}
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Nenhuma venda registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Book Sales Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Vendas por Livro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {bookStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bookStats}
                            dataKey="sales"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => 
                              `${name.substring(0, 10)}${name.length > 10 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                          >
                            {bookStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [value, name]}
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Nenhuma venda registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Purchases Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Compras Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Livro</th>
                          <th className="text-left py-3 px-2 font-medium">Valor</th>
                          <th className="text-left py-3 px-2 font-medium">Taxa</th>
                          <th className="text-left py-3 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.slice(0, 20).map((purchase) => {
                          const book = biblicalBooks.find((b) => b.id === purchase.book_id);
                          return (
                            <tr key={purchase.id} className="border-b">
                              <td className="py-3 px-2">{book?.title || purchase.book_id}</td>
                              <td className="py-3 px-2">R$ {purchase.amount_paid.toFixed(2)}</td>
                              <td className="py-3 px-2">R$ {purchase.service_fee.toFixed(2)}</td>
                              <td className="py-3 px-2">
                                {new Date(purchase.created_at).toLocaleDateString("pt-BR")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma compra registrada ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}