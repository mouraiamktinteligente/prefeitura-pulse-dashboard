-- Remover políticas RLS existentes que causam o problema
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sessões" ON public.sessoes_ativas;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias sessões" ON public.sessoes_ativas;
DROP POLICY IF EXISTS "Administradores podem ver todas as sessões" ON public.sessoes_ativas;
DROP POLICY IF EXISTS "Administradores podem gerenciar todas as sessões" ON public.sessoes_ativas;

-- Criar políticas RLS simplificadas que não dependem de auth.jwt()
-- Política para permitir SELECT das próprias sessões
CREATE POLICY "Usuários podem ver suas próprias sessões simples" 
ON public.sessoes_ativas 
FOR SELECT 
USING (
  user_email IN (
    SELECT email FROM usuarios_sistema 
    WHERE email = user_email AND ativo = true
  )
);

-- Política para permitir INSERT de novas sessões para usuários válidos
CREATE POLICY "Usuários válidos podem criar sessões" 
ON public.sessoes_ativas 
FOR INSERT 
WITH CHECK (
  user_email IN (
    SELECT email FROM usuarios_sistema 
    WHERE email = user_email AND ativo = true
  )
);

-- Política para permitir UPDATE das próprias sessões
CREATE POLICY "Usuários podem atualizar suas próprias sessões" 
ON public.sessoes_ativas 
FOR UPDATE 
USING (
  user_email IN (
    SELECT email FROM usuarios_sistema 
    WHERE email = user_email AND ativo = true
  )
)
WITH CHECK (
  user_email IN (
    SELECT email FROM usuarios_sistema 
    WHERE email = user_email AND ativo = true
  )
);

-- Política para permitir DELETE das próprias sessões
CREATE POLICY "Usuários podem deletar suas próprias sessões" 
ON public.sessoes_ativas 
FOR DELETE 
USING (
  user_email IN (
    SELECT email FROM usuarios_sistema 
    WHERE email = user_email AND ativo = true
  )
);

-- Política para administradores verem todas as sessões
CREATE POLICY "Administradores podem ver todas as sessões simples" 
ON public.sessoes_ativas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM usuarios_sistema 
    WHERE email = user_email 
    AND tipo_usuario = 'administrador' 
    AND ativo = true
  )
);

-- Política para administradores gerenciarem todas as sessões
CREATE POLICY "Administradores podem gerenciar todas as sessões simples" 
ON public.sessoes_ativas 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios_sistema 
    WHERE email = user_email 
    AND tipo_usuario = 'administrador' 
    AND ativo = true
  )
)
WITH CHECK (true);