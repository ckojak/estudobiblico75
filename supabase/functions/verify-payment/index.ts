import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { sessionId, bookId } = await req.json();
    logStep("Request payload", { sessionId, bookId });

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Check if purchase already exists
    const { data: existingPurchase } = await supabaseClient
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      logStep("Purchase already exists", { purchaseId: existingPurchase.id });
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
        stripe_payment_intent_id: session.payment_intent as string,
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