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
  
export const updateMoviesWithVariants = async (
    moviesData: { results: any[] },
    setMovies: React.Dispatch<React.SetStateAction<any[]>>,
    setVariants?: React.Dispatch<React.SetStateAction<any>>
  ) => {
    
    const cachedVariants = JSON.parse(localStorage.getItem('cachedVariants') || '{}');
    const currentTime = Date.now();
    
    const variants = await fetchVariants(); 
    if (setVariants) {
      setVariants(variants);
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
        const variant = variants[movie.id];
  
        if (variant) {
          cachedVariants[movie.id] = {
            variant,
            timestamp: currentTime,
          };
          localStorage.setItem('cachedVariants', JSON.stringify(cachedVariants));
          const fixedVariant = fixVariant(variant)
          return { ...movie, fixedVariant };
        }
        return movie;
      })
    );
  
    startTransition(() => {
      setMovies(updatedMovies); 
    });
};