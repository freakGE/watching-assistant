import router from "next/router";

interface Title {
  id: string;
  media_type?: string;
  type?: string;
}
const SCROLL_DELAY = 100

export const movieDetails = (
  title: Title,
  queryType?: string | string[],
  useReplace: boolean = false
) => {
  const resolvedQueryType = typeof queryType === 'string' ? queryType : undefined;
  const mediaType = resolvedQueryType || title.media_type || title.type;

  const pushOrReplace = useReplace ? router.replace : router.push;

  if (mediaType === "person") {
    pushOrReplace({ 
      pathname: `/name/${title.id}` }, 
      undefined, 
      { scroll: false }, //{ shallow: true }
      ).then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }, SCROLL_DELAY);
      }).catch(e => {
        console.error('Error navigating to person details:', e);
        if (!e.cancelled) {
          throw e;
        }
      });
  } else if (mediaType === "movie" || mediaType === "tv") {
    pushOrReplace(
      { pathname: `/title/${mediaType}`, query: { i: title.id } },
      undefined,
      { scroll: false }, //{ shallow: true }
    ).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }, SCROLL_DELAY);
    }).catch(e => {
      console.error('Error navigating to title details:', e);
      if (!e.cancelled) {
        throw e;
      }
    });
  } else {
    console.warn('Unsupported media type:', mediaType);
  }
};