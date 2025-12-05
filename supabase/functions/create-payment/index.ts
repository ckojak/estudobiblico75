import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const createPaymentSchema = z.object({
  bookId: z.string().min(1, "Book ID is required").max(100, "Book ID too long"),
  bookTitle: z.string().min(1, "Book title is required").max(200, "Book title too long"),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    // Parse and validate input
    const body = await req.json();
    const parseResult = createPaymentSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(", ");
      logStep("Validation failed", { errors: errorMessage });
      return new Response(JSON.stringify({ error: `Invalid input: ${errorMessage}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { bookId, bookTitle } = parseResult.data;
    logStep("Input validated", { bookId, bookTitle });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Fetch book price from database (prevents price manipulation)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Check if bookId is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
    
    let book;
    let bookError;
    
    if (isUUID) {
      const result = await supabaseAdmin
        .from("books")
        .select("id, sale_price, title")
        .eq("id", bookId)
        .single();
      book = result.data;
      bookError = result.error;
    } else {
      // Try to find by slug
      const result = await supabaseAdmin
        .from("books")
        .select("id, sale_price, title")
        .eq("slug", bookId)
        .single();
      book = result.data;
      bookError = result.error;
    }
    
    if (bookError || !book) {
      logStep("Book not found", { bookId, error: bookError });
      return new Response(JSON.stringify({ error: "Book not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    const actualBookId = book.id;
    const amount = book.sale_price;
    logStep("Book price fetched from database", { bookId: actualBookId, amount });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Payment system not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Total amount including service fee (R$ 0.93)
    const serviceFee = 0.93;
    const totalAmount = Math.round((amount + serviceFee) * 100); // Convert to cents
    logStep("Calculated total", { baseAmount: amount, serviceFee, totalCents: totalAmount });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      // Enable automatic payment methods - accepts PIX, Boleto, Cards based on Stripe dashboard config
      payment_method_types: undefined, // Let Stripe decide based on automatic_payment_methods
      line_items: [
        {
          price_data: {
            currency: "brl", // Force BRL (Reais)
            product_data: {
              name: book.title || bookTitle,
              description: `E-book Bíblico - ${book.title || bookTitle}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Enable automatic payment methods for PIX/Boleto support
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      success_url: `${req.headers.get("origin")}/sucesso?session_id={CHECKOUT_SESSION_ID}&book_id=${actualBookId}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        bookId: actualBookId,
        userId: user.id,
        serviceFee: serviceFee.toString(),
      },
      // For async payment methods (PIX/Boleto), wait for completion
      payment_intent_data: {
        metadata: {
          bookId: actualBookId,
          userId: user.id,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
