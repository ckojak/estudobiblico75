import { useState } from "react";
import { Upload, Check, Loader2, X, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PixReceiptUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle?: string;
}

const PixReceiptUpload = ({ open, onOpenChange, bookTitle }: PixReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para enviar o comprovante");
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pix-receipts')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      setUploaded(true);
      toast.success("Comprovante enviado com sucesso! Aguarde a confirmação.");
      
      setTimeout(() => {
        onOpenChange(false);
        setUploaded(false);
        setPreview(null);
        setSelectedFile(null);
      }, 2000);

    } catch (error: any) {
      console.error("Error uploading receipt:", error);
      toast.error(error.message || "Erro ao enviar comprovante");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-500" />
            Enviar Comprovante PIX
          </DialogTitle>
          <DialogDescription>
            {bookTitle 
              ? `Envie o comprovante de pagamento para "${bookTitle}"`
              : "Envie o comprovante do pagamento PIX para confirmar sua compra"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploaded ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-teal-500" />
              </div>
              <h4 className="font-medium text-foreground">Comprovante Enviado!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Você receberá uma confirmação em breve.
              </p>
            </div>
          ) : (
            <>
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para selecionar</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WebP ou PDF (máx. 5MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="relative">
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-48 object-contain bg-muted/30"
                      />
                      <button
                        onClick={clearSelection}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearSelection}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Comprovante
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Após enviar, nossa equipe irá verificar o pagamento e liberar seu acesso.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixReceiptUpload;
