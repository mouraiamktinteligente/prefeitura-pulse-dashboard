-- Criar função RPC para criar usuário (com SECURITY DEFINER para bypass de RLS)
CREATE OR REPLACE FUNCTION public.create_usuario_sistema(
  p_tipo_usuario tipo_usuario,
  p_tipo_pessoa tipo_pessoa,
  p_nome_completo text,
  p_cpf_cnpj text,
  p_email text DEFAULT NULL,
  p_senha_hash text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_endereco_cep text DEFAULT NULL,
  p_endereco_rua text DEFAULT NULL,
  p_endereco_numero text DEFAULT NULL,
  p_endereco_complemento text DEFAULT NULL,
  p_endereco_bairro text DEFAULT NULL,
  p_endereco_cidade text DEFAULT NULL,
  p_endereco_estado text DEFAULT NULL,
  p_razao_social text DEFAULT NULL,
  p_nome_responsavel text DEFAULT NULL,
  p_permissoes jsonb DEFAULT NULL,
  p_cliente_id uuid DEFAULT NULL,
  p_ativo boolean DEFAULT true,
  p_session_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_new_user usuarios_sistema;
BEGIN
  -- Verificar se o usuário que está fazendo a requisição é admin com sessão ativa
  SELECT EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.user_email = p_session_email
      AND sa.ativo = true
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.ativo = true
  ) INTO v_is_admin;

  -- Se não é admin, negar acesso
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Apenas administradores podem criar usuários';
  END IF;

  -- Inserir usuário (SECURITY DEFINER permite bypass de RLS)
  INSERT INTO public.usuarios_sistema (
    tipo_usuario,
    tipo_pessoa,
    nome_completo,
    cpf_cnpj,
    email,
    senha_hash,
    whatsapp,
    endereco_cep,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    endereco_cidade,
    endereco_estado,
    razao_social,
    nome_responsavel,
    permissoes,
    cliente_id,
    ativo
  ) VALUES (
    p_tipo_usuario,
    p_tipo_pessoa,
    p_nome_completo,
    p_cpf_cnpj,
    p_email,
    p_senha_hash,
    p_whatsapp,
    p_endereco_cep,
    p_endereco_rua,
    p_endereco_numero,
    p_endereco_complemento,
    p_endereco_bairro,
    p_endereco_cidade,
    p_endereco_estado,
    p_razao_social,
    p_nome_responsavel,
    p_permissoes,
    p_cliente_id,
    p_ativo
  )
  RETURNING * INTO v_new_user;

  -- Retornar dados do usuário criado como JSON
  RETURN row_to_json(v_new_user);
END;
$$;

-- Criar função RPC para atualizar usuário
CREATE OR REPLACE FUNCTION public.update_usuario_sistema(
  p_id uuid,
  p_tipo_usuario tipo_usuario DEFAULT NULL,
  p_tipo_pessoa tipo_pessoa DEFAULT NULL,
  p_nome_completo text DEFAULT NULL,
  p_cpf_cnpj text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_senha_hash text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_endereco_cep text DEFAULT NULL,
  p_endereco_rua text DEFAULT NULL,
  p_endereco_numero text DEFAULT NULL,
  p_endereco_complemento text DEFAULT NULL,
  p_endereco_bairro text DEFAULT NULL,
  p_endereco_cidade text DEFAULT NULL,
  p_endereco_estado text DEFAULT NULL,
  p_razao_social text DEFAULT NULL,
  p_nome_responsavel text DEFAULT NULL,
  p_permissoes jsonb DEFAULT NULL,
  p_cliente_id uuid DEFAULT NULL,
  p_ativo boolean DEFAULT NULL,
  p_session_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_updated_user usuarios_sistema;
BEGIN
  -- Verificar se o usuário que está fazendo a requisição é admin com sessão ativa
  SELECT EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.user_email = p_session_email
      AND sa.ativo = true
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.ativo = true
  ) INTO v_is_admin;

  -- Se não é admin, negar acesso
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Apenas administradores podem atualizar usuários';
  END IF;

  -- Atualizar usuário (apenas campos não-null)
  UPDATE public.usuarios_sistema
  SET
    tipo_usuario = COALESCE(p_tipo_usuario, tipo_usuario),
    tipo_pessoa = COALESCE(p_tipo_pessoa, tipo_pessoa),
    nome_completo = COALESCE(p_nome_completo, nome_completo),
    cpf_cnpj = COALESCE(p_cpf_cnpj, cpf_cnpj),
    email = COALESCE(p_email, email),
    senha_hash = COALESCE(p_senha_hash, senha_hash),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    endereco_cep = COALESCE(p_endereco_cep, endereco_cep),
    endereco_rua = COALESCE(p_endereco_rua, endereco_rua),
    endereco_numero = COALESCE(p_endereco_numero, endereco_numero),
    endereco_complemento = COALESCE(p_endereco_complemento, endereco_complemento),
    endereco_bairro = COALESCE(p_endereco_bairro, endereco_bairro),
    endereco_cidade = COALESCE(p_endereco_cidade, endereco_cidade),
    endereco_estado = COALESCE(p_endereco_estado, endereco_estado),
    razao_social = COALESCE(p_razao_social, razao_social),
    nome_responsavel = COALESCE(p_nome_responsavel, nome_responsavel),
    permissoes = COALESCE(p_permissoes, permissoes),
    cliente_id = COALESCE(p_cliente_id, cliente_id),
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_updated_user;

  -- Retornar dados do usuário atualizado como JSON
  RETURN row_to_json(v_updated_user);
END;
$$;

-- Criar função RPC para deletar usuário
CREATE OR REPLACE FUNCTION public.delete_usuario_sistema(
  p_id uuid,
  p_session_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Verificar se o usuário que está fazendo a requisição é admin com sessão ativa
  SELECT EXISTS (
    SELECT 1 FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.user_email = p_session_email
      AND sa.ativo = true
      AND sa.expires_at > now()
      AND us.tipo_usuario = 'administrador'
      AND us.ativo = true
  ) INTO v_is_admin;

  -- Se não é admin, negar acesso
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Apenas administradores podem deletar usuários';
  END IF;

  -- Deletar usuário
  DELETE FROM public.usuarios_sistema
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;