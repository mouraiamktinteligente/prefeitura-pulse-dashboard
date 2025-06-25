
-- Tornar o bucket analises-documentos privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'analises-documentos';

-- Criar políticas RLS para o bucket privado
CREATE POLICY "Permitir leitura para usuários autenticados" ON storage.objects
FOR SELECT USING (bucket_id = 'analises-documentos');

CREATE POLICY "Permitir upload para usuários autenticados" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'analises-documentos');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON storage.objects
FOR DELETE USING (bucket_id = 'analises-documentos');
