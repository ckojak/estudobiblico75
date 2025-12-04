import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const getDownloadUrlSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-DOWNLOAD-URL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Parse and validate input
    const body = await req.json();
    const parseResult = getDownloadUrlSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(", ");
      logStep("Validation failed", { errors: errorMessage });
      return new Response(JSON.stringify({ error: `Invalid input: ${errorMessage}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { bookId } = parseResult.data;
    logStep("Input validated", { bookId });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAnon.auth.getUser(token);
    
    if (authError || !userData.user) {
      logStep("Authentication failed", { error: authError });
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First, get the book info to find the correct file path
    const { data: book, error: bookError } = await supabaseAdmin
      .from("books")
      .select("id, slug, pdf_file_path, title")
      .eq("id", bookId)
      .maybeSingle();

    if (bookError) {
      logStep("Error fetching book", { error: bookError });
      return new Response(JSON.stringify({ error: "Failed to fetch book info" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!book) {
      logStep("Book not found", { bookId });
      return new Response(JSON.stringify({ error: "Book not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Book found", { bookId: book.id, slug: book.slug, pdfPath: book.pdf_file_path });

    // Verify purchase
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .eq("status", "completed")
      .maybeSingle();

    if (purchaseError) {
      logStep("Error checking purchase", { error: purchaseError });
      return new Response(JSON.stringify({ error: "Failed to verify purchase" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!purchase) {
      logStep("Purchase not found", { userId: user.id, bookId });
      return new Response(JSON.stringify({ error: "Você não comprou este livro" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    logStep("Purchase verified", { purchaseId: purchase.id });

    // Check if PDF file path exists
    if (!book.pdf_file_path) {
      logStep("PDF not available", { bookId, slug: book.slug });
      return new Response(JSON.stringify({ error: "PDF ainda não disponível. Entre em contato com o suporte." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Use the stored pdf_file_path from the database (e.g., "books/apocalipse.pdf")
    const filePath = book.pdf_file_path;
    logStep("Using file path", { filePath });
    
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from("ebooks")
      .createSignedUrl(filePath, 300); // 5 minutes expiry

    if (signedUrlError) {
      logStep("Error generating signed URL", { error: signedUrlError, filePath });
      return new Response(JSON.stringify({ error: "Arquivo PDF não encontrado. Entre em contato com o suporte." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Signed URL generated", { filePath, expiresIn: "5 minutes" });

    return new Response(JSON.stringify({ url: signedUrlData.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
