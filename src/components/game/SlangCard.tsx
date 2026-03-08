import { Tables } from '@/integrations/supabase/types';
import { getGenerationColor } from '@/lib/gameUtils';

type SlangWord = Tables<'slang_words'>;

interface SlangCardProps {
  slang: SlangWord;
  showMeaning?: boolean;
  showDetails?: boolean;
}

export function SlangCard({ slang, showMeaning = false, showDetails = false }: SlangCardProps) {
  return (
    <div className="card-game text-center animate-scale-in">
      <div className="mb-4">
        <span className={`generation-badge ${getGenerationColor(slang.generation)}`}>
          {slang.generation}
        </span>
      </div>
      <h2 className="slang-word text-gradient mb-6">
        {slang.word}
      </h2>
      {showMeaning && (
        <div className="animate-fade-in space-y-4">
          <p className="text-lg text-foreground/80 font-medium">
            {slang.meaning}
          </p>
          {showDetails && (
            <>
              {slang.related_terms && slang.related_terms.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {slang.related_terms.map(term => (
                    <span key={term} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                      {term}
                    </span>
                  ))}
                </div>
              )}
              {slang.extra_context && (
                <p className="text-sm text-muted-foreground italic">
                  {slang.extra_context}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
