-- Add unique constraint on stripe_payment_intent_id to prevent duplicate purchases
CREATE UNIQUE INDEX IF NOT EXISTS purchases_stripe_payment_intent_id_unique 
ON purchases (stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;