-- Adicionar coluna acao_tomada se não existir
ALTER TABLE public.alerta_crise_notificacao 
ADD COLUMN IF NOT EXISTS acao_tomada TEXT;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.alerta_crise_notificacao ENABLE ROW LEVEL SECURITY;

-- Política de leitura para alertas de crise
CREATE POLICY "Usuários podem visualizar alertas de suas prefeituras"
ON public.alerta_crise_notificacao
FOR SELECT
TO public
USING (
  -- Admins veem tudo
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now() 
    AND us.tipo_usuario = 'administrador'
    AND us.cliente_id IS NULL
  )
  OR
  -- Usuários veem apenas de seus clientes
  (instagram_prefeitura IN (
    SELECT cc.instagram_prefeitura FROM cadastro_clientes cc
    JOIN usuarios_sistema us ON us.cliente_id = cc.id
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true AND sa.expires_at > now()
  )
  OR instagram_prefeito IN (
    SELECT cc.instagram_prefeito FROM cadastro_clientes cc
    JOIN usuarios_sistema us ON us.cliente_id = cc.id
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true AND sa.expires_at > now()
  ))
);

-- Política de atualização para marcar alertas como visualizados
CREATE POLICY "Usuários podem atualizar alertas de suas prefeituras"
ON public.alerta_crise_notificacao
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true AND sa.expires_at > now()
  )
);