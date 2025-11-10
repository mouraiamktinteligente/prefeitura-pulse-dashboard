-- Habilitar RLS na tabela analise_consolidada_semanal
ALTER TABLE analise_consolidada_semanal ENABLE ROW LEVEL SECURITY;

-- Política de leitura: todos podem ler
CREATE POLICY "Permitir leitura de análises consolidadas"
ON analise_consolidada_semanal
FOR SELECT
USING (true);

-- Política de inserção: sistema pode inserir
CREATE POLICY "Permitir inserção de análises consolidadas"
ON analise_consolidada_semanal
FOR INSERT
WITH CHECK (true);

-- Política de exclusão: todos podem deletar
CREATE POLICY "Permitir exclusão de análises consolidadas"
ON analise_consolidada_semanal
FOR DELETE
USING (true);

-- Habilitar realtime para a tabela
ALTER TABLE analise_consolidada_semanal REPLICA IDENTITY FULL;