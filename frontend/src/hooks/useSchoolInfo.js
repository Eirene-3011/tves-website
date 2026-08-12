import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useSchoolInfo() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/school-info')
      .then(res => setInfo(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { info, loading };
}
