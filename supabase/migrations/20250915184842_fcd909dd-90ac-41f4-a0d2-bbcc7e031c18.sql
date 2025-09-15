-- Função para detectar e alertar sobre possíveis inconsistências nos links dos relatórios
CREATE OR REPLACE FUNCTION public.verificar_consistencia_links_relatorios()
RETURNS TABLE(
  tabela text,
  id bigint,
  profile text,
  issue_type text,
  description text,
  link_relatorio text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar perfis de prefeitura na tabela de Instagram que possam ter links de prefeito
  RETURN QUERY
  SELECT 
    'relatorio_analise_instagram'::text as tabela,
    rai.id,
    rai.profile,
    'POSSIBLE_WRONG_LINK'::text as issue_type,
    CASE 
      WHEN rai.profile LIKE '%prefeitura%' AND EXISTS (
        SELECT 1 FROM relatorio_analise_prefeito rap 
        WHERE rap.link_relatorio = rai.link_relatorio
      ) THEN 'Link de prefeitura pode estar associado a relatório de prefeito'
      ELSE 'Verificar se o link corresponde ao tipo de perfil'
    END as description,
    rai.link_relatorio
  FROM relatorio_analise_instagram rai
  WHERE rai.profile LIKE '%prefeitura%' 
    AND rai.link_relatorio IS NOT NULL;

  -- Verificar perfis de prefeito na tabela de Instagram que possam ter links errados  
  RETURN QUERY
  SELECT 
    'relatorio_analise_instagram'::text as tabela,
    rai.id,
    rai.profile,
    'VERIFY_PREFEITO_LINK'::text as issue_type,
    'Verificar se link de prefeito está correto na tabela Instagram'::text as description,
    rai.link_relatorio
  FROM relatorio_analise_instagram rai
  WHERE rai.profile LIKE '%prefeito%' 
    AND rai.link_relatorio IS NOT NULL;

  -- Verificar links duplicados entre tabelas
  RETURN QUERY
  SELECT 
    'DUPLICATE_LINKS'::text as tabela,
    rai.id,
    rai.profile,
    'DUPLICATE_BETWEEN_TABLES'::text as issue_type,
    'Link duplicado entre tabela Instagram e Prefeito'::text as description,
    rai.link_relatorio
  FROM relatorio_analise_instagram rai
  INNER JOIN relatorio_analise_prefeito rap ON rai.link_relatorio = rap.link_relatorio
  WHERE rai.link_relatorio IS NOT NULL;
END;
$function$;

-- Função para registrar logs de debug de acesso aos relatórios
CREATE TABLE IF NOT EXISTS public.debug_relatorios_acesso (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  action text NOT NULL,
  profile text,
  tabela_origem text,
  link_acessado text,
  metadata jsonb
);

-- Enable RLS
ALTER TABLE public.debug_relatorios_acesso ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção de logs
CREATE POLICY "Permitir inserção de logs debug" 
ON public.debug_relatorios_acesso 
FOR INSERT 
WITH CHECK (true);

-- Policy para leitura apenas por administradores
CREATE POLICY "Apenas admins podem ler logs debug" 
ON public.debug_relatorios_acesso 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM usuarios_sistema us
    JOIN sessoes_ativas sa ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.ativo = true
  )
);