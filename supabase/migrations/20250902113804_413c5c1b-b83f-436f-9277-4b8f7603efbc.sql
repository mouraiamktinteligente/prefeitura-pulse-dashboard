-- Update RLS policy for instagram_posts to allow public read access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.instagram_posts;

-- Create new policy allowing public read access
CREATE POLICY "Enable public read access for instagram posts" 
ON public.instagram_posts 
FOR SELECT 
USING (true);

-- Keep the table secure for write operations by maintaining authenticated-only policies for INSERT/UPDATE/DELETE
CREATE POLICY "Enable insert for authenticated users only" 
ON public.instagram_posts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Enable update for authenticated users only" 
ON public.instagram_posts 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Enable delete for authenticated users only" 
ON public.instagram_posts 
FOR DELETE 
USING (auth.role() = 'authenticated'::text);