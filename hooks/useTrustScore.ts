import { useState } from 'react';

export const useTrustScore = () => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = async (metrics: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      const data = await res.json();
      setScore(data.score);
    } finally {
      setLoading(false);
    }
  };

  return { score, fetchScore, loading };
};