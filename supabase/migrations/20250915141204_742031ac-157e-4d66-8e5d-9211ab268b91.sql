-- Corrigir função para buscar posts monitorados - ajustar tipo de retorno
DROP FUNCTION IF EXISTS public.buscar_posts_monitorados(text[]);

CREATE OR REPLACE FUNCTION public.buscar_posts_monitorados(perfis text[])
RETURNS TABLE(total_posts numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(rpmpc.total_posts_monitorados), 0) as total_posts
  FROM "Resumo Posts Monitorados Por Cliente" rpmpc
  WHERE rpmpc.perfil_monitorado = ANY(perfis);
END;
$function$