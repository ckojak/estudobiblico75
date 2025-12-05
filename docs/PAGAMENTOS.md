# Pagamentos

A partir de agora, o site NÃO aceita mais upload de comprovante diretamente pelo site.

Fluxo atualizado:

- Faça o PIX para a chave: costaconde@gmail.com
- Envie o comprovante por WhatsApp para: +55 21 96510-6389 (ou clique no link de contato na página)
- No WhatsApp, inclua seu nome e e-mail para que possamos identificar o pagamento.

Observação:

- Arquivos de comprovantes não serão mais aceitos pelo site. Adicionamos um script em scripts/cleanup-comprovantes.ts para ajudar a remover arquivos já armazenados no servidor. Faça backup antes de executar.
- Se houver comprovantes armazenados no histórico do Git (commits anteriores), será necessário reescrever o histórico com ferramentas como git filter-repo ou BFG (essa operação reescreve commits e requer coordenação com colaboradores).
