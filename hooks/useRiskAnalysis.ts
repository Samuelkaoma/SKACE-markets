import { useState } from 'react';
import { ScamResult } from '@/lib/types';

export const useRiskAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const checkContent = async (text: string): Promise<ScamResult> => {
    setLoading(true);
    const res = await fetch('/api/scam-check', {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    setLoading(false);
    return data;
  };

  return { checkContent, loading };
};