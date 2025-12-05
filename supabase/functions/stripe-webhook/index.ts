import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("ERROR: Invalid webhook signature", { error: err instanceof Error ? err.message : String(err) });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else {
      // Parse without verification (for development)
      event = JSON.parse(body);
      logStep("WARNING: Webhook signature not verified (no secret configured)");
    }

    logStep("Event type", { type: event.type });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle relevant events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id, paymentStatus: session.payment_status });

        // For async payment methods (PIX/Boleto), payment_status may be 'unpaid'
        if (session.payment_status === "paid") {
          await handleSuccessfulPayment(supabaseAdmin, session);
        } else {
          logStep("Payment pending (async method)", { sessionId: session.id });
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        // This handles PIX/Boleto payments that complete after checkout
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Async payment succeeded", { sessionId: session.id });
        await handleSuccessfulPayment(supabaseAdmin, session);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Async payment failed", { sessionId: session.id });
        
        // Update purchase status to failed if exists
        const bookId = session.metadata?.bookId;
        const userId = session.metadata?.userId;
        
        if (bookId && userId) {
          await supabaseAdmin
            .from("purchases")
            .update({ status: "failed" })
            .eq("user_id", userId)
            .eq("book_id", bookId)
            .eq("status", "pending");
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount 
        });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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

async function handleSuccessfulPayment(supabaseAdmin: any, session: Stripe.Checkout.Session) {
  const bookId = session.metadata?.bookId;
  const userId = session.metadata?.userId;
  const serviceFee = parseFloat(session.metadata?.serviceFee || "0.93");

  if (!bookId || !userId) {
    logStep("ERROR: Missing metadata", { bookId, userId });
    return;
  }

  logStep("Processing successful payment", { bookId, userId });

  // Check if purchase already exists
  const { data: existingPurchase } = await supabaseAdmin
    .from("purchases")
    .select("id, status")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existingPurchase) {
    if (existingPurchase.status === "completed") {
      logStep("Purchase already completed", { purchaseId: existingPurchase.id });
      return;
    }
    
    // Update existing purchase to completed
    const { error: updateError } = await supabaseAdmin
      .from("purchases")
      .update({ 
        status: "completed",
        stripe_payment_intent_id: session.payment_intent,
        completed_at: new Date().toISOString()
      })
      .eq("id", existingPurchase.id);

    if (updateError) {
      logStep("ERROR updating purchase", { error: updateError });
    } else {
      logStep("Purchase updated to completed", { purchaseId: existingPurchase.id });
    }
  } else {
    // Create new purchase record
    const amountPaid = (session.amount_total || 0) / 100;

    const { error: insertError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: userId,
        book_id: bookId,
        amount_paid: amountPaid,
        service_fee: serviceFee,
        status: "completed",
        stripe_payment_intent_id: session.payment_intent,
        completed_at: new Date().toISOString()
      });

    if (insertError) {
      logStep("ERROR creating purchase", { error: insertError });
    } else {
      logStep("Purchase created successfully", { userId, bookId, amountPaid });
    }
  }
}
