-- Corrigir função para buscar posts monitorados
CREATE OR REPLACE FUNCTION public.buscar_posts_monitorados(perfis text[])
RETURNS TABLE(total_posts bigint)
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