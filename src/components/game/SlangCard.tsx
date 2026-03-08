import { Tables } from '@/integrations/supabase/types';
import { getGenerationColor } from '@/lib/gameUtils';

type SlangWord = Tables<'slang_words'>;

interface SlangCardProps {
  slang: SlangWord;
  showMeaning?: boolean;
  showDetails?: boolean;
  showGeneration?: boolean;
  blurred?: boolean;
  heroSize?: boolean;
}

export function SlangCard({ slang, showMeaning = false, showDetails = false, showGeneration = false, blurred = false, heroSize = false }: SlangCardProps) {
  return (
    <div className={`text-center animate-scale-in ${heroSize ? '' : 'card-game'}`}>
      {showGeneration && (
        <div className="mb-4">
          <span className={`generation-badge ${getGenerationColor(slang.generation)}`}>
            {slang.generation}
          </span>
        </div>
      )}
      <h2
        className={`font-display font-bold text-center leading-tight text-gradient transition-all duration-700 ${
          heroSize ? 'text-6xl sm:text-7xl md:text-8xl' : 'text-5xl md:text-7xl'
        } ${blurred ? 'blur-xl select-none' : 'blur-0'}`}
      >
        {slang.word}
      </h2>
      {showMeaning && (
        <div className="animate-fade-in space-y-4 mt-6">
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
