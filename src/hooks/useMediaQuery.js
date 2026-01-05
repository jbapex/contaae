import { useState, useEffect, useMemo } from 'react';

const useMediaQuery = (query) => {
  const mediaQuery = useMemo(() => typeof window !== 'undefined' ? window.matchMedia(query) : null, [query]);
  const [matches, setMatches] = useState(mediaQuery ? mediaQuery.matches : false);

  useEffect(() => {
    if (!mediaQuery) return;
    
    const listener = () => setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);

    if (mediaQuery.matches !== matches) {
      setMatches(mediaQuery.matches);
    }
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mediaQuery, matches]);

  return matches;
};

export default useMediaQuery;