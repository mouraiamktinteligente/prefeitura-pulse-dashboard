-- Habilitar real-time para tabela instagram_posts
-- Configurar REPLICA IDENTITY FULL para capturar dados completos durante updates
ALTER TABLE public.instagram_posts REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação supabase_realtime para ativar funcionalidade real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_posts;