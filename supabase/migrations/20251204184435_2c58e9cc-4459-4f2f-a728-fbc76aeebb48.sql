-- Create storage bucket for PIX receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('pix-receipts', 'pix-receipts', false);

-- Allow authenticated users to upload their receipts
CREATE POLICY "Users can upload their own receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pix-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'pix-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all receipts
CREATE POLICY "Admins can view all pix receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'pix-receipts'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add receipt column to purchases table
ALTER TABLE public.purchases
ADD COLUMN pix_receipt_url TEXT;

-- Allow users to update their own purchase with receipt
CREATE POLICY "Users can add receipt to their purchases"
ON public.purchases
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);