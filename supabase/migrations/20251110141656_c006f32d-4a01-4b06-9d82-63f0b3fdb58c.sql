-- Ajustar RLS policies para permitir login
-- Remover a policy restritiva de SELECT
DROP POLICY IF EXISTS "Usuários veem seu próprio registro" ON usuarios_sistema;

-- Criar nova policy que permite SELECT público para usuários ativos (necessário para login)
CREATE POLICY "Permitir leitura de usuários ativos para autenticação"
ON usuarios_sistema
FOR SELECT
TO public
USING (ativo = true);

-- Manter a policy de administradores para operações de escrita
-- (a policy "Admins gerenciam todos os usuários" já existe para ALL operations)