import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, BookOpen, Loader2, Trash2, FileUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Book {
  id: string;
  title: string;
  slug: string;
  testament: string | null;
  original_price: number;
  sale_price: number;
  description: string | null;
  cover_image_url: string | null;
  pdf_file_path: string | null;
  book_order: number | null;
}

export function AdminBookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // New book form state
  const [newBook, setNewBook] = useState({
    title: "",
    slug: "",
    testament: "estudo",
    originalPrice: "14.90",
    salePrice: "5.00",
    description: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("book_order", { ascending: true });

    if (error) {
      console.error("Error loading books:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os livros.",
        variant: "destructive",
      });
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setNewBook({
      ...newBook,
      title,
      slug: generateSlug(title),
    });
  };

  const uploadPdfToStorage = async (bookSlug: string, file: File) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("Não autenticado");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookSlug", bookSlug);

    const response = await supabase.functions.invoke("upload-book-pdf", {
      body: formData,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.slug) {
      toast({
        title: "Erro",
        description: "Título e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Insert book into database
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .insert({
          title: newBook.title,
          slug: newBook.slug,
          testament: newBook.testament,
          original_price: parseFloat(newBook.originalPrice),
          sale_price: parseFloat(newBook.salePrice),
          description: newBook.description,
          cover_image_url: `/covers/${newBook.slug}.jpg`,
          pdf_file_path: `books/${newBook.slug}.pdf`,
          book_order: books.length + 1,
        })
        .select()
        .single();

      if (bookError) {
        throw bookError;
      }

      // Upload PDF if provided
      if (pdfFile) {
        await uploadPdfToStorage(newBook.slug, pdfFile);
      }

      toast({
        title: "Sucesso",
        description: "Livro adicionado com sucesso!",
      });

      // Reset form
      setNewBook({
        title: "",
        slug: "",
        testament: "estudo",
        originalPrice: "14.90",
        salePrice: "5.00",
        description: "",
      });
      setPdfFile(null);
      setCoverFile(null);
      setShowAddForm(false);
      loadBooks();

    } catch (error: any) {
      console.error("Error adding book:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o livro.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPdf = async (book: Book) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        await uploadPdfToStorage(book.slug, file);
        
        // Update book record
        await supabase
          .from("books")
          .update({ pdf_file_path: `books/${book.slug}.pdf` })
          .eq("id", book.id);

        toast({
          title: "Sucesso",
          description: `PDF do livro "${book.title}" enviado com sucesso!`,
        });
        loadBooks();
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Erro no upload",
          description: error.message || "Não foi possível enviar o PDF.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`Tem certeza que deseja excluir "${book.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", book.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Livro excluído com sucesso.",
      });
      loadBooks();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o livro.",
        variant: "destructive",
      });
    }
  };

  const getTestamentLabel = (testament: string | null) => {
    switch (testament) {
      case "antigo": return "AT";
      case "novo": return "NT";
      case "estudo": return "Estudo";
      default: return testament || "-";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Gerenciar Livros ({books.length})
          </CardTitle>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Livro
          </Button>
        </CardHeader>

        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newBook.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Nome do livro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newBook.slug}
                    onChange={(e) => setNewBook({ ...newBook, slug: e.target.value })}
                    placeholder="slug-do-livro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={newBook.testament}
                    onValueChange={(value) => setNewBook({ ...newBook, testament: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="antigo">Antigo Testamento</SelectItem>
                      <SelectItem value="novo">Novo Testamento</SelectItem>
                      <SelectItem value="estudo">Estudo Bíblico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                  <Input
                    id="originalPrice"
                    value={newBook.originalPrice}
                    onChange={(e) => setNewBook({ ...newBook, originalPrice: e.target.value })}
                    placeholder="14.90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Preço Venda (R$)</Label>
                  <Input
                    id="salePrice"
                    value={newBook.salePrice}
                    onChange={(e) => setNewBook({ ...newBook, salePrice: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Breve descrição do livro..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                {pdfFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {pdfFile.name}
                  </p>
                )}
              </div>

              <Button onClick={handleAddBook} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Livro
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Capa</th>
                  <th className="text-left py-3 px-2 font-medium">Título</th>
                  <th className="text-left py-3 px-2 font-medium">Categoria</th>
                  <th className="text-left py-3 px-2 font-medium">Preço</th>
                  <th className="text-left py-3 px-2 font-medium">PDF</th>
                  <th className="text-left py-3 px-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b">
                    <td className="py-3 px-2">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary">
                        {getTestamentLabel(book.testament)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <p className="line-through text-muted-foreground text-xs">
                          R$ {book.original_price.toFixed(2)}
                        </p>
                        <p className="font-medium text-primary">
                          R$ {book.sale_price.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {book.pdf_file_path ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Enviado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUploadPdf(book)}
                          disabled={uploading}
                        >
                          <FileUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBook(book)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
