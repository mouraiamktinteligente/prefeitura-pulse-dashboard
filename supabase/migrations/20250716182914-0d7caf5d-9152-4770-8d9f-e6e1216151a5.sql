-- Desconectar usuário marcoaurelioexp@gmail.com
UPDATE public.sessoes_ativas 
SET ativo = false, updated_at = now()
WHERE user_email = 'marcoaurelioexp@gmail.com' AND ativo = true;

UPDATE public.usuarios_sistema 
SET status_conexao = 'desconectado'
WHERE email = 'marcoaurelioexp@gmail.com';