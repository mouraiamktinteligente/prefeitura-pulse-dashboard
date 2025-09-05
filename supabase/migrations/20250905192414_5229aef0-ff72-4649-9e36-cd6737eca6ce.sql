-- Create table for calendar events
CREATE TABLE public.calendario_de_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  hora_evento TIME NOT NULL,
  objetivo TEXT,
  mensagem TEXT,
  publico_alvo TEXT,
  hashtags TEXT[],
  tipo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendario_de_eventos ENABLE ROW LEVEL SECURITY;

-- Create policies for event access
CREATE POLICY "Users can view calendar events" 
ON public.calendario_de_eventos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create calendar events" 
ON public.calendario_de_eventos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update calendar events" 
ON public.calendario_de_eventos 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete calendar events" 
ON public.calendario_de_eventos 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendario_eventos_updated_at
BEFORE UPDATE ON public.calendario_de_eventos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to cliente_id
ALTER TABLE public.calendario_de_eventos 
ADD CONSTRAINT fk_calendario_eventos_cliente 
FOREIGN KEY (cliente_id) REFERENCES public.cadastro_clientes(id) ON DELETE CASCADE;