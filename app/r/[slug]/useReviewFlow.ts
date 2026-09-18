'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

interface Company {
  id: string;
  google_review_url: string;
}

export function useReviewFlow(company: Company, accent: string, alwaysRedirect: boolean) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pick = (n: number) => {
    setRating(n);

    if (alwaysRedirect || n >= 4) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: [accent, '#FFFFFF', '#F5E6C8'],
      });
    }

    void supabase.from('ratings').insert([{ company_id: company.id, rating: n }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await supabase.from('feedbacks').insert([
      {
        company_id: company.id,
        rating,
        message,
        customer_contact: contact || null,
      },
    ]);

    setIsSubmitting(false);
    setSent(true);
  };

  const reset = () => {
    setRating(0);
    setHover(0);
    setSent(false);
    setMessage('');
    setContact('');
  };

  const step: 'pick' | 'positive' | 'negative' | 'thanks' = sent
    ? 'thanks'
    : rating === 0
      ? 'pick'
      : alwaysRedirect || rating >= 4
        ? 'positive'
        : 'negative';

  return {
    rating,
    hover,
    setHover,
    pick,
    step,
    message,
    setMessage,
    contact,
    setContact,
    handleSubmit,
    isSubmitting,
    reset,
  };
}
