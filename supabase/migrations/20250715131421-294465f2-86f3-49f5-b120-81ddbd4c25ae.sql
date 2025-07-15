-- Create policies to allow read access to relatorio_analise_instagram
CREATE POLICY "Allow read access to relatorio_analise_instagram" 
ON public.relatorio_analise_instagram 
FOR SELECT 
USING (true);

-- Create policies to allow insert access to relatorio_analise_instagram
CREATE POLICY "Allow insert access to relatorio_analise_instagram" 
ON public.relatorio_analise_instagram 
FOR INSERT 
WITH CHECK (true);

-- Create policies to allow delete access to relatorio_analise_instagram
CREATE POLICY "Allow delete access to relatorio_analise_instagram" 
ON public.relatorio_analise_instagram 
FOR DELETE 
USING (true);