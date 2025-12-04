import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required").regex(/^cs_/, "Invalid Stripe session ID format"),
  bookId: z.string().uuid("Invalid book ID format"),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Parse and validate input
    const body = await req.json();
    const parseResult = verifyPaymentSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(", ");
      logStep("Validation failed", { errors: errorMessage });
      return new Response(JSON.stringify({ error: `Invalid input: ${errorMessage}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { sessionId, bookId } = parseResult.data;
    logStep("Input validated", { sessionId, bookId });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: userData } = await supabaseAnon.auth.getUser(token);
    const user = userData.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: user.id });

    // Verify book exists
    const { data: book, error: bookError } = await supabaseClient
      .from("books")
      .select("id, sale_price")
      .eq("id", bookId)
      .single();
    
    if (bookError || !book) {
      logStep("Book not found", { bookId, error: bookError });
      return new Response(JSON.stringify({ error: "Book not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Verify session metadata matches the bookId
    if (session.metadata?.bookId !== bookId) {
      logStep("Book ID mismatch", { sessionBookId: session.metadata?.bookId, requestBookId: bookId });
      throw new Error("Payment session does not match the requested book");
    }

    const paymentIntentId = session.payment_intent as string;
    
    // Check if purchase already exists for this payment intent (prevents duplicates)
    const { data: existingPurchase } = await supabaseClient
      .from("purchases")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (existingPurchase) {
      logStep("Purchase already exists for this payment", { purchaseId: existingPurchase.id, paymentIntentId });
      return new Response(JSON.stringify({ success: true, alreadyPurchased: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .insert({
        user_id: user.id,
        book_id: bookId,
        stripe_payment_intent_id: paymentIntentId,
        amount_paid: (session.amount_total || 0) / 100,
        service_fee: 0.50,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (purchaseError) {
      logStep("Error creating purchase", { error: purchaseError });
      throw new Error("Failed to create purchase record");
    }

    logStep("Purchase created", { purchaseId: purchase.id });

    return new Response(JSON.stringify({ success: true, purchaseId: purchase.id }), {
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
