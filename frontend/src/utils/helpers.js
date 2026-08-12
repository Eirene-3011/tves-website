export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  return `${base}${url}`;
};

export const truncate = (str, len = 120) => {
  if (!str) return '';
  const plain = str.replace(/<[^>]+>/g, '');
  return plain.length > len ? plain.slice(0, len) + '...' : plain;
};

export const slugify = (str) =>
  str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

export const gradeLabel = (gl) => {
  if (!gl) return '';
  return gl;
};
