export const getFullImageUrl = (url: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BACKEND_URL;
  if (!url) return '/placeholder-image.png';
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url}`;
};
