-- ETAPA 1: Adicionar coluna cliente_id em usuarios_sistema
ALTER TABLE usuarios_sistema 
ADD COLUMN cliente_id uuid REFERENCES cadastro_clientes(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX idx_usuarios_cliente ON usuarios_sistema(cliente_id);

-- Comentário explicativo
COMMENT ON COLUMN usuarios_sistema.cliente_id IS 
'ID da prefeitura vinculada. NULL = acesso geral (apenas para administradores)';

-- ETAPA 2: Habilitar RLS em usuarios_sistema
ALTER TABLE usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Policy 1: Administradores podem gerenciar todos os usuários
CREATE POLICY "Admins gerenciam todos os usuários"
ON usuarios_sistema
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.ativo = true
  )
);

-- Policy 2: Usuários veem apenas seu próprio registro
CREATE POLICY "Usuários veem seu próprio registro"
ON usuarios_sistema
FOR SELECT
TO authenticated
USING (true);

-- ETAPA 3: Atualizar RLS para alertas_comentarios (PADRÃO A - campo profile)
DROP POLICY IF EXISTS "Enable read access for users with active sessions" ON alertas_comentarios;

CREATE POLICY "Acesso baseado em prefeitura vinculada"
ON alertas_comentarios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  profile IN (
    SELECT cc.instagram_prefeitura FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
    UNION
    SELECT cc.instagram_prefeito FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
  )
);

-- ETAPA 4: Atualizar RLS para instagram_posts (campo profile)
DROP POLICY IF EXISTS "Enable public read access for instagram posts" ON instagram_posts;

CREATE POLICY "Acesso posts por prefeitura"
ON instagram_posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  profile IN (
    SELECT cc.instagram_prefeitura FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
    UNION
    SELECT cc.instagram_prefeito FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
  )
);

-- ETAPA 5: Atualizar RLS para marketing_campanhas (PADRÃO B - campo cliente_id)
DROP POLICY IF EXISTS "Usuários podem visualizar campanhas de marketing" ON marketing_campanhas;

CREATE POLICY "Acesso campanhas por cliente_id"
ON marketing_campanhas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

-- ETAPA 6: Atualizar RLS para calendario_de_eventos (campo cliente_id)
DROP POLICY IF EXISTS "Users can view calendar events" ON calendario_de_eventos;

CREATE POLICY "Acesso eventos por cliente_id"
ON calendario_de_eventos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

DROP POLICY IF EXISTS "Users can create calendar events" ON calendario_de_eventos;
DROP POLICY IF EXISTS "Users can update calendar events" ON calendario_de_eventos;
DROP POLICY IF EXISTS "Users can delete calendar events" ON calendario_de_eventos;

-- Recriar policies de escrita
CREATE POLICY "Criar eventos próprios"
ON calendario_de_eventos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

CREATE POLICY "Atualizar eventos próprios"
ON calendario_de_eventos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

CREATE POLICY "Deletar eventos próprios"
ON calendario_de_eventos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

-- ETAPA 7: Atualizar RLS para documentos_analisados (campo cliente_id)
DROP POLICY IF EXISTS "Permitir acesso completo aos documentos" ON documentos_analisados;

CREATE POLICY "Acesso documentos por cliente_id"
ON documentos_analisados
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  cliente_id IN (
    SELECT us.cliente_id FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON sa.user_email = us.email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.ativo = true
  )
);

-- ETAPA 8: Atualizar RLS para relatorio_analise_instagram (campo profile)
DROP POLICY IF EXISTS "Allow read access to relatorio_analise_instagram" ON relatorio_analise_instagram;
DROP POLICY IF EXISTS "Allow insert access to relatorio_analise_instagram" ON relatorio_analise_instagram;
DROP POLICY IF EXISTS "Allow delete access to relatorio_analise_instagram" ON relatorio_analise_instagram;

CREATE POLICY "Acesso relatorios instagram por prefeitura"
ON relatorio_analise_instagram
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  profile IN (
    SELECT cc.instagram_prefeitura FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
    UNION
    SELECT cc.instagram_prefeito FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
  )
);

-- ETAPA 9: Atualizar RLS para analise_consolidada_semanal (campo profile)
DROP POLICY IF EXISTS "Permitir leitura de análises consolidadas" ON analise_consolidada_semanal;
DROP POLICY IF EXISTS "Permitir inserção de análises consolidadas" ON analise_consolidada_semanal;
DROP POLICY IF EXISTS "Permitir exclusão de análises consolidadas" ON analise_consolidada_semanal;

CREATE POLICY "Acesso analises consolidadas por prefeitura"
ON analise_consolidada_semanal
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.cliente_id IS NULL
      AND us.ativo = true
  )
  OR
  profile IN (
    SELECT cc.instagram_prefeitura FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
    UNION
    SELECT cc.instagram_prefeito FROM cadastro_clientes cc
    JOIN sessoes_ativas sa ON EXISTS (
      SELECT 1 FROM usuarios_sistema us 
      WHERE us.email = sa.user_email 
        AND us.cliente_id = cc.id
        AND sa.ativo = true
        AND sa.expires_at > now()
    )
  )
);