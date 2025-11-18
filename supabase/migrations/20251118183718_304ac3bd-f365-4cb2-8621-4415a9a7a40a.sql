-- Adicionar política de DELETE para relatorio_analise_instagram
CREATE POLICY "Permitir delete de relatórios Instagram"
ON public.relatorio_analise_instagram
FOR DELETE
TO public
USING (true);

-- Adicionar política de DELETE para analise_consolidada_semanal
CREATE POLICY "Permitir delete de análises consolidadas"
ON public.analise_consolidada_semanal
FOR DELETE
TO public
USING (true);