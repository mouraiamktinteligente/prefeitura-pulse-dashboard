-- Enable RLS for all report tables
ALTER TABLE public.relatorio_analise_prefeito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorio_analise_web ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorio_qualitativo ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read access to all report tables
CREATE POLICY "Allow read access to relatorio_analise_prefeito" 
ON public.relatorio_analise_prefeito 
FOR SELECT 
USING (true);

CREATE POLICY "Allow read access to relatorio_analise_web" 
ON public.relatorio_analise_web 
FOR SELECT 
USING (true);

CREATE POLICY "Allow read access to relatorio_qualitativo" 
ON public.relatorio_qualitativo 
FOR SELECT 
USING (true);

-- Create policies to allow insert access to all report tables
CREATE POLICY "Allow insert access to relatorio_analise_prefeito" 
ON public.relatorio_analise_prefeito 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow insert access to relatorio_analise_web" 
ON public.relatorio_analise_web 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow insert access to relatorio_qualitativo" 
ON public.relatorio_qualitativo 
FOR INSERT 
WITH CHECK (true);

-- Create policies to allow delete access to all report tables
CREATE POLICY "Allow delete access to relatorio_analise_prefeito" 
ON public.relatorio_analise_prefeito 
FOR DELETE 
USING (true);

CREATE POLICY "Allow delete access to relatorio_analise_web" 
ON public.relatorio_analise_web 
FOR DELETE 
USING (true);

CREATE POLICY "Allow delete access to relatorio_qualitativo" 
ON public.relatorio_qualitativo 
FOR DELETE 
USING (true);