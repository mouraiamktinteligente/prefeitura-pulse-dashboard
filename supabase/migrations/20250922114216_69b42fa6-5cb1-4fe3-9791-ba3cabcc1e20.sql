-- Enable RLS and permissive policies for linkweb_monitoramento_cliente so links can be saved/loaded
ALTER TABLE public.linkweb_monitoramento_cliente ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "Allow read access to linkweb_monitoramento_cliente"
ON public.linkweb_monitoramento_cliente
FOR SELECT
USING (true);

-- Insert policy
CREATE POLICY "Allow insert access to linkweb_monitoramento_cliente"
ON public.linkweb_monitoramento_cliente
FOR INSERT
WITH CHECK (true);

-- Update policy
CREATE POLICY "Allow update access to linkweb_monitoramento_cliente"
ON public.linkweb_monitoramento_cliente
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Delete policy
CREATE POLICY "Allow delete access to linkweb_monitoramento_cliente"
ON public.linkweb_monitoramento_cliente
FOR DELETE
USING (true);