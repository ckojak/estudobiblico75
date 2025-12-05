-- Migration: remover coluna que armazenava URL do comprovante (ajuste o nome da tabela se necessário)
ALTER TABLE IF EXISTS payments
  DROP COLUMN IF EXISTS comprovante_url;
