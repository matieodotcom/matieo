-- tributes
CREATE TABLE public.tributes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id  uuid        NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  text        NOT NULL,
  message      text        NOT NULL CHECK (char_length(message) <= 500),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_tributes_memorial_id ON public.tributes(memorial_id);
ALTER TABLE public.tributes ENABLE ROW LEVEL SECURITY;

-- anyone can read tributes
CREATE POLICY "Public can view tributes"
  ON public.tributes FOR SELECT USING (true);

-- authenticated users can post
CREATE POLICY "Authenticated users can post tributes"
  ON public.tributes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- users can delete their own tributes
CREATE POLICY "Users can delete own tributes"
  ON public.tributes FOR DELETE USING (auth.uid() = user_id);

-- condolences
CREATE TABLE public.condolences (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id  uuid        NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  text        NOT NULL,
  message      text        NOT NULL CHECK (char_length(message) <= 500),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_condolences_obituary_id ON public.condolences(obituary_id);
ALTER TABLE public.condolences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view condolences"
  ON public.condolences FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post condolences"
  ON public.condolences FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own condolences"
  ON public.condolences FOR DELETE USING (auth.uid() = user_id);
