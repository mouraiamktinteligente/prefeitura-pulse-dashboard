-- Função RPC para buscar posts do Instagram com validação de sessão
CREATE OR REPLACE FUNCTION public.get_instagram_posts(
  p_profile text DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_limit integer DEFAULT 1,
  p_order_by text DEFAULT 'created_at',
  p_ascending boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  profile text,
  instagram_post_id text,
  image_url text,
  link_publico_imagem text,
  description text,
  likes_count integer,
  comments_count integer,
  post_url text,
  created_at timestamptz,
  updated_at timestamptz,
  profile_prefeito text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      ip.id, ip.profile, ip.instagram_post_id, ip.image_url,
      ip.link_publico_imagem, ip.description, ip.likes_count,
      ip.comments_count, ip.post_url, ip.created_at, ip.updated_at,
      ip.profile_prefeito
    FROM instagram_posts ip
    WHERE (p_profile IS NULL OR ip.profile = p_profile)
    ORDER BY 
      CASE WHEN p_order_by = 'created_at' THEN ip.created_at END DESC,
      CASE WHEN p_order_by = 'likes_count' THEN ip.likes_count END DESC
    LIMIT p_limit;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      ip.id, ip.profile, ip.instagram_post_id, ip.image_url,
      ip.link_publico_imagem, ip.description, ip.likes_count,
      ip.comments_count, ip.post_url, ip.created_at, ip.updated_at,
      ip.profile_prefeito
    FROM instagram_posts ip
    WHERE ip.profile = ANY(v_allowed_profiles)
      AND (p_profile IS NULL OR ip.profile = p_profile)
    ORDER BY 
      CASE WHEN p_order_by = 'created_at' THEN ip.created_at END DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Função RPC para buscar alertas de comentários
CREATE OR REPLACE FUNCTION public.get_alertas_comentarios(
  p_profile text DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_limit integer DEFAULT 1
)
RETURNS TABLE(
  id uuid,
  profile text,
  created_at timestamptz,
  updated_at timestamptz,
  negative_comment_1 text,
  negative_username_1 varchar,
  score_negative_1 text,
  link_comentario_negativo_1 text,
  negative_comment_2 text,
  negative_username_2 text,
  score_negative_2 text,
  link_comentario_negativo_2 text,
  negative_comment_3 text,
  negative_username_3 text,
  score_negative_3 text,
  link_comentario_negativo_3 text,
  negative_comment_4 text,
  negative_username_4 text,
  score_negative_4 text,
  link_comentario_negativo_4 text,
  positive_comment_1 text,
  positive_username_1 varchar,
  score_positive_1 text,
  link_comentario_positivo_1 text,
  positive_comment_2 text,
  positive_username_2 text,
  score_positive_2 text,
  link_comentario_positivo_2 text,
  positive_comment_3 text,
  positive_username_3 text,
  score_positive_3 text,
  link_comentario_positivo_3 text,
  positive_comment_4 text,
  positive_username_4 text,
  score_positive_4 text,
  link_comentario_positivo_4 text,
  profile_negative_1 text,
  profile_negative_2 text,
  profile_negative_3 text,
  profile_negative_4 text,
  profile_positive_1 text,
  profile_positive_2 text,
  profile_positive_3 text,
  profile_positive_4 text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      ac.id, ac.profile, ac.created_at, ac.updated_at,
      ac.negative_comment_1, ac.negative_username_1, ac.score_negative_1, ac.link_comentario_negativo_1,
      ac.negative_comment_2, ac.negative_username_2, ac.score_negative_2, ac.link_comentario_negativo_2,
      ac.negative_comment_3, ac.negative_username_3, ac.score_negative_3, ac.link_comentario_negativo_3,
      ac.negative_comment_4, ac.negative_username_4, ac.score_negative_4, ac.link_comentario_negativo_4,
      ac.positive_comment_1, ac.positive_username_1, ac.score_positive_1, ac.link_comentario_positivo_1,
      ac.positive_comment_2, ac.positive_username_2, ac.score_positive_2, ac.link_comentario_positivo_2,
      ac.positive_comment_3, ac.positive_username_3, ac.score_positive_3, ac.link_comentario_positivo_3,
      ac.positive_comment_4, ac.positive_username_4, ac.score_positive_4, ac.link_comentario_positivo_4,
      ac.profile_negative_1, ac.profile_negative_2, ac.profile_negative_3, ac.profile_negative_4,
      ac.profile_positive_1, ac.profile_positive_2, ac.profile_positive_3, ac.profile_positive_4
    FROM alertas_comentarios ac
    WHERE (p_profile IS NULL OR ac.profile = p_profile)
    ORDER BY ac.created_at DESC
    LIMIT p_limit;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      ac.id, ac.profile, ac.created_at, ac.updated_at,
      ac.negative_comment_1, ac.negative_username_1, ac.score_negative_1, ac.link_comentario_negativo_1,
      ac.negative_comment_2, ac.negative_username_2, ac.score_negative_2, ac.link_comentario_negativo_2,
      ac.negative_comment_3, ac.negative_username_3, ac.score_negative_3, ac.link_comentario_negativo_3,
      ac.negative_comment_4, ac.negative_username_4, ac.score_negative_4, ac.link_comentario_negativo_4,
      ac.positive_comment_1, ac.positive_username_1, ac.score_positive_1, ac.link_comentario_positivo_1,
      ac.positive_comment_2, ac.positive_username_2, ac.score_positive_2, ac.link_comentario_positivo_2,
      ac.positive_comment_3, ac.positive_username_3, ac.score_positive_3, ac.link_comentario_positivo_3,
      ac.positive_comment_4, ac.positive_username_4, ac.score_positive_4, ac.link_comentario_positivo_4,
      ac.profile_negative_1, ac.profile_negative_2, ac.profile_negative_3, ac.profile_negative_4,
      ac.profile_positive_1, ac.profile_positive_2, ac.profile_positive_3, ac.profile_positive_4
    FROM alertas_comentarios ac
    WHERE ac.profile = ANY(v_allowed_profiles)
      AND (p_profile IS NULL OR ac.profile = p_profile)
    ORDER BY ac.created_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Função RPC para buscar relatórios do Instagram
CREATE OR REPLACE FUNCTION public.get_relatorios_instagram(
  p_profiles text[] DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  profile text,
  nome text,
  link_relatorio text,
  link_analise text,
  nome_relatorio text,
  nome_analise text,
  id_analise text,
  id_relatorio text,
  created_at timestamptz,
  "UUID" text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      rai.id, rai.profile, rai.nome, rai.link_relatorio, rai.link_analise,
      rai.nome_relatorio, rai.nome_analise, rai.id_analise, 
      rai.id_relatorio, rai.created_at, rai."UUID"
    FROM relatorio_analise_instagram rai
    WHERE (p_profiles IS NULL OR rai.profile = ANY(p_profiles))
      AND (rai.link_relatorio IS NOT NULL OR rai.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR rai.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rai.created_at < p_end_date::timestamptz)
    ORDER BY rai.created_at DESC;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      rai.id, rai.profile, rai.nome, rai.link_relatorio, rai.link_analise,
      rai.nome_relatorio, rai.nome_analise, rai.id_analise, 
      rai.id_relatorio, rai.created_at, rai."UUID"
    FROM relatorio_analise_instagram rai
    WHERE rai.profile = ANY(v_allowed_profiles)
      AND (p_profiles IS NULL OR rai.profile = ANY(p_profiles))
      AND (rai.link_relatorio IS NOT NULL OR rai.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR rai.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rai.created_at < p_end_date::timestamptz)
    ORDER BY rai.created_at DESC;
  END IF;
END;
$$;

-- Função RPC para buscar relatórios do Prefeito
CREATE OR REPLACE FUNCTION public.get_relatorios_prefeito(
  p_profiles text[] DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  profile text,
  nome text,
  link_relatorio text,
  link_analise text,
  nome_relatorio text,
  nome_analise text,
  id_analise text,
  id_relatorio text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      rap.id, rap.profile, rap.nome, rap.link_relatorio, rap.link_analise,
      rap.nome_relatorio, rap.nome_analise, rap.id_analise, 
      rap.id_relatorio, rap.created_at
    FROM relatorio_analise_prefeito rap
    WHERE (p_profiles IS NULL OR rap.profile = ANY(p_profiles))
      AND (rap.link_relatorio IS NOT NULL OR rap.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR rap.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rap.created_at < p_end_date::timestamptz)
    ORDER BY rap.created_at DESC;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      rap.id, rap.profile, rap.nome, rap.link_relatorio, rap.link_analise,
      rap.nome_relatorio, rap.nome_analise, rap.id_analise, 
      rap.id_relatorio, rap.created_at
    FROM relatorio_analise_prefeito rap
    WHERE rap.profile = ANY(v_allowed_profiles)
      AND (p_profiles IS NULL OR rap.profile = ANY(p_profiles))
      AND (rap.link_relatorio IS NOT NULL OR rap.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR rap.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rap.created_at < p_end_date::timestamptz)
    ORDER BY rap.created_at DESC;
  END IF;
END;
$$;

-- Função RPC para buscar relatórios Web
CREATE OR REPLACE FUNCTION public.get_relatorios_web(
  p_profiles text[] DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  profile text,
  nome text,
  link_relatorio text,
  link_analise text,
  nome_documento text,
  nome_analise text,
  nome_relatorio text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      raw.id, raw.profile, raw.nome, raw.link_relatorio, raw.link_analise,
      raw.nome_documento, raw.nome_analise, raw.nome_relatorio, raw.created_at
    FROM relatorio_analise_web raw
    WHERE (p_profiles IS NULL OR raw.profile = ANY(p_profiles))
      AND (raw.link_relatorio IS NOT NULL OR raw.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR raw.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR raw.created_at < p_end_date::timestamptz)
    ORDER BY raw.created_at DESC;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      raw.id, raw.profile, raw.nome, raw.link_relatorio, raw.link_analise,
      raw.nome_documento, raw.nome_analise, raw.nome_relatorio, raw.created_at
    FROM relatorio_analise_web raw
    WHERE raw.profile = ANY(v_allowed_profiles)
      AND (p_profiles IS NULL OR raw.profile = ANY(p_profiles))
      AND (raw.link_relatorio IS NOT NULL OR raw.link_analise IS NOT NULL)
      AND (p_start_date IS NULL OR raw.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR raw.created_at < p_end_date::timestamptz)
    ORDER BY raw.created_at DESC;
  END IF;
END;
$$;

-- Função RPC para buscar relatórios qualitativos
CREATE OR REPLACE FUNCTION public.get_relatorios_qualitativo(
  p_profiles text[] DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  profile text,
  nome text,
  link_relatorio text,
  nome_documento text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      rq.id, rq.profile, rq.nome, rq.link_relatorio,
      rq.nome_documento, rq.created_at
    FROM relatorio_qualitativo rq
    WHERE (p_profiles IS NULL OR rq.profile = ANY(p_profiles))
      AND rq.link_relatorio IS NOT NULL
      AND (p_start_date IS NULL OR rq.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rq.created_at < p_end_date::timestamptz)
    ORDER BY rq.created_at DESC;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      rq.id, rq.profile, rq.nome, rq.link_relatorio,
      rq.nome_documento, rq.created_at
    FROM relatorio_qualitativo rq
    WHERE rq.profile = ANY(v_allowed_profiles)
      AND (p_profiles IS NULL OR rq.profile = ANY(p_profiles))
      AND rq.link_relatorio IS NOT NULL
      AND (p_start_date IS NULL OR rq.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR rq.created_at < p_end_date::timestamptz)
    ORDER BY rq.created_at DESC;
  END IF;
END;
$$;

-- Função RPC para buscar análises consolidadas
CREATE OR REPLACE FUNCTION public.get_relatorios_consolidados(
  p_profiles text[] DEFAULT NULL,
  p_session_email text DEFAULT NULL,
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  profile text,
  nome text,
  link_analise text,
  nome_analise text,
  id_analise text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_cliente_id uuid;
  v_allowed_profiles text[];
BEGIN
  IF p_session_email IS NULL THEN
    RAISE EXCEPTION 'SESSION_EMAIL_REQUIRED: Email da sessão é obrigatório';
  END IF;

  SELECT 
    (us.tipo_usuario = 'administrador' AND us.cliente_id IS NULL),
    us.cliente_id
  INTO v_is_admin, v_cliente_id
  FROM sessoes_ativas sa
  JOIN usuarios_sistema us ON us.email = sa.user_email
  WHERE sa.user_email = p_session_email
    AND sa.ativo = true
    AND sa.expires_at > now()
    AND us.ativo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_SESSION: Sessão inválida ou expirada';
  END IF;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      acs.id, acs.profile, acs.nome, acs.link_analise,
      acs.nome_analise, acs.id_analise, acs.created_at
    FROM analise_consolidada_semanal acs
    WHERE (p_profiles IS NULL OR acs.profile = ANY(p_profiles))
      AND acs.link_analise IS NOT NULL
      AND (p_start_date IS NULL OR acs.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR acs.created_at < p_end_date::timestamptz)
    ORDER BY acs.created_at DESC;
  ELSE
    IF v_cliente_id IS NULL THEN
      RAISE EXCEPTION 'NO_CLIENT_ACCESS: Usuário não tem acesso a nenhum cliente';
    END IF;

    SELECT ARRAY[cc.instagram_prefeitura, cc.instagram_prefeito]
    INTO v_allowed_profiles
    FROM cadastro_clientes cc
    WHERE cc.id = v_cliente_id;

    RETURN QUERY
    SELECT 
      acs.id, acs.profile, acs.nome, acs.link_analise,
      acs.nome_analise, acs.id_analise, acs.created_at
    FROM analise_consolidada_semanal acs
    WHERE acs.profile = ANY(v_allowed_profiles)
      AND (p_profiles IS NULL OR acs.profile = ANY(p_profiles))
      AND acs.link_analise IS NOT NULL
      AND (p_start_date IS NULL OR acs.created_at >= p_start_date::timestamptz)
      AND (p_end_date IS NULL OR acs.created_at < p_end_date::timestamptz)
    ORDER BY acs.created_at DESC;
  END IF;
END;
$$;