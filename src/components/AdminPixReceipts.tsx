import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Check, 
  X, 
  Eye, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Receipt,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { biblicalBooks } from "@/data/biblicalBooks";

interface PixPurchase {
  id: string;
  book_id: string;
  user_id: string;
  amount_paid: number;
  status: string;
  created_at: string;
  pix_receipt_url: string | null;
  profiles?: {
    email: string | null;
    full_name: string | null;
  };
}

interface StorageFile {
  name: string;
  created_at: string;
}

export function AdminPixReceipts() {
  const [purchases, setPurchases] = useState<PixPurchase[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<{userId: string, files: StorageFile[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PixPurchase | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('pix-receipts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all purchases (pending and completed) that might have PIX receipts
      const { data: purchasesData, error } = await supabase
        .from("purchases")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Type assertion for the nested profiles
      const typedPurchases = (purchasesData || []).map(p => ({
        ...p,
        profiles: p.profiles as unknown as { email: string | null; full_name: string | null } | undefined
      }));

      setPurchases(typedPurchases);

      // Load receipts from storage
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .from('pix-receipts')
        .list('', { limit: 100 });

      if (!bucketError && bucketData) {
        // Get files from each user folder
        const receiptsPromises = bucketData
          .filter(item => !item.name.includes('.'))
          .map(async (folder) => {
            const { data: files } = await supabase
              .storage
              .from('pix-receipts')
              .list(folder.name);
            return { userId: folder.name, files: files || [] };
          });

        const receipts = await Promise.all(receiptsPromises);
        setPendingReceipts(receipts.filter(r => r.files.length > 0));
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    }
    setLoading(false);
  };

  const getReceiptUrl = async (userId: string, fileName: string): Promise<string | null> => {
    const { data } = await supabase
      .storage
      .from('pix-receipts')
      .createSignedUrl(`${userId}/${fileName}`, 3600);
    
    return data?.signedUrl || null;
  };

  const viewReceipt = async (userId: string, fileName: string) => {
    const url = await getReceiptUrl(userId, fileName);
    if (url) {
      setSelectedImage(url);
    } else {
      toast.error("Erro ao carregar imagem");
    }
  };

  const approvePurchase = async (purchase: PixPurchase, receiptFile?: { userId: string; fileName: string }) => {
    setApproving(purchase.id);
    try {
      let receiptUrl = purchase.pix_receipt_url;

      // If we have a receipt file, get its URL
      if (receiptFile) {
        receiptUrl = `${receiptFile.userId}/${receiptFile.fileName}`;
      }

      // Update purchase status to completed
      const { error } = await supabase
        .from("purchases")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          pix_receipt_url: receiptUrl
        })
        .eq("id", purchase.id);

      if (error) throw error;

      toast.success("Pagamento aprovado com sucesso!");
      loadData();
    } catch (error) {
      console.error("Error approving purchase:", error);
      toast.error("Erro ao aprovar pagamento");
    }
    setApproving(null);
    setSelectedPurchase(null);
  };

  const rejectPurchase = async (purchaseId: string) => {
    setRejecting(purchaseId);
    try {
      const { error } = await supabase
        .from("purchases")
        .update({
          status: "rejected"
        })
        .eq("id", purchaseId);

      if (error) throw error;

      toast.success("Pagamento rejeitado");
      loadData();
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      toast.error("Erro ao rejeitar pagamento");
    }
    setRejecting(null);
  };

  const getBookTitle = (bookId: string) => {
    const book = biblicalBooks.find(b => b.id === bookId);
    return book?.title || bookId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      case "pending":
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  // Get pending purchases that need approval
  const pendingPurchases = purchases.filter(p => p.status === "pending");
  const completedPurchases = purchases.filter(p => p.status === "completed");
  const rejectedPurchases = purchases.filter(p => p.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPurchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPurchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejeitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedPurchases.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Pending Receipts from Storage */}
      {pendingReceipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-500" />
              Comprovantes Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pendingReceipts.map(receipt => 
                receipt.files.map(file => (
                  <div 
                    key={`${receipt.userId}-${file.name}`}
                    className="relative group cursor-pointer"
                    onClick={() => viewReceipt(receipt.userId, file.name)}
                  >
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border hover:border-primary/50 transition-colors">
                      <Receipt className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {new Date(file.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pagamentos Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPurchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium">Livro</th>
                    <th className="text-left py-3 px-2 font-medium">Valor</th>
                    <th className="text-left py-3 px-2 font-medium">Data</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{purchase.profiles?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{purchase.profiles?.email || "—"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">{getBookTitle(purchase.book_id)}</td>
                      <td className="py-3 px-2">R$ {purchase.amount_paid.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        {new Date(purchase.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-2">{getStatusBadge(purchase.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          {purchase.pix_receipt_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewReceipt(purchase.user_id, purchase.pix_receipt_url!.split('/').pop()!)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => approvePurchase(purchase)}
                            disabled={approving === purchase.id}
                          >
                            {approving === purchase.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectPurchase(purchase.id)}
                            disabled={rejecting === purchase.id}
                          >
                            {rejecting === purchase.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
              <p>Nenhum pagamento pendente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approved/Rejected */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {[...completedPurchases, ...rejectedPurchases].slice(0, 10).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium">Livro</th>
                    <th className="text-left py-3 px-2 font-medium">Valor</th>
                    <th className="text-left py-3 px-2 font-medium">Data</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...completedPurchases, ...rejectedPurchases]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((purchase) => (
                      <tr key={purchase.id} className="border-b">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{purchase.profiles?.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{purchase.profiles?.email || "—"}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">{getBookTitle(purchase.book_id)}</td>
                        <td className="py-3 px-2">R$ {purchase.amount_paid.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          {new Date(purchase.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(purchase.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprovante PIX</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Comprovante PIX" 
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
