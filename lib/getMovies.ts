import { startTransition } from "react";

export const fetchVariants = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/get-db?short=true`,
      {
        next: {
          revalidate: 60 * 60 * 4,
        },
      }
    );
    const data = await response.json();
  
    return data;
  };
  
export const fixVariant = (variant: string) => {
    switch (variant) {
      case "watching":
        return "Watching";
      case "on-hold":
        return "On-Hold";
      case "to-watch":
        return "To Watch";
      case "dropped":
        return "Dropped";
      case "completed":
        return "Completed";
      default:
        return variant;
    }
  };

let globalVariantsCache: any = null; 

export const updateMoviesWithVariants = async (
    moviesData: { results: any[] },
    setMovies: React.Dispatch<React.SetStateAction<any[]>>,
  ) => {    
    // localStorage.clear()
    const cachedVariants = JSON.parse(localStorage.getItem('cachedVariants') || '{}');
    const currentTime = Date.now();
    
    if (!globalVariantsCache) {
      globalVariantsCache = await fetchVariants();
    } else {
      const hasDifferentVariants = moviesData.results.some(movie => {
        const cachedData = cachedVariants[movie.id];
        const currentVariant = globalVariantsCache[movie.id];
        return cachedData && (!currentVariant || cachedData.variant !== currentVariant);
      });
   
      if (hasDifferentVariants) {
        globalVariantsCache = cachedVariants || await fetchVariants();
        // globalVariantsCache = await fetchVariants();
      }
    }
    
    const allCached = moviesData.results.every(movie => {
      const cachedData = cachedVariants[movie.id];
      return cachedData && (currentTime - cachedData.timestamp < 4 * 60 * 60 * 1000);
    });
    
    if (allCached) {
      const cachedMovies = moviesData.results.map(movie => ({
        ...movie,
        variant: fixVariant(cachedVariants[movie.id].variant),
      }));
      startTransition(() => {
        setMovies(cachedMovies);
      });
      return;
    }
  
    const updatedMovies = await Promise.all(
      moviesData.results.map(async (movie) => {
        const cachedData = cachedVariants[movie.id]; 
        if (cachedData && (currentTime - cachedData.timestamp < 4 * 60 * 60 * 1000)) {
          return { ...movie, variant: fixVariant(cachedData.variant) }; 
        }
        const variant = globalVariantsCache[movie.id];
        const fixedVariant = fixVariant(variant)
        
        if (variant) {
          cachedVariants[movie.id] = {
            variant: fixedVariant,
            timestamp: currentTime,
          };
          try {
            localStorage.setItem('cachedVariants', JSON.stringify(cachedVariants));
          } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
              // If storage is full, remove the oldest item
              const sortedEntries = Object.entries(cachedVariants).sort(
                ([, a], [, b]) => (a as any).timestamp - (b as any).timestamp
              );
          
              const oldestEntryKey = sortedEntries[0][0];
              delete cachedVariants[oldestEntryKey];
          
              localStorage.setItem('cachedVariants', JSON.stringify(cachedVariants));
            } else {
              console.error('Unknown error:', e);
            }};
          return { ...movie, variant: fixedVariant };
        }
        return movie;
      })
    );
  
    startTransition(() => {
      setMovies(updatedMovies); 
    });
};