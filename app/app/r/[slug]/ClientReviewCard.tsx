'use client';

import { useState } from 'react';
import { Star, Send, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ClientReviewCard({ company }: { company: any }) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  const handleRatingClick = (stars: number) => {
    setRating(stars);
  };

  const handlePrivateFeedbackSubmit = async (e: React.FormEvent) => {
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
    setFeedbackSent(true);
  };

  return (
    <div className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4">
      {rating === 0 && (
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Jak oceniasz dzisiejszą wizytę?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRatingClick(star)}
              >
                <Star
                  className={`w-9 h-9 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {rating >= 4 && (
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Bardzo się cieszymy!</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Będzie nam niezmiernie miło, jeśli podzielisz się opinią na Google.
          </p>
          <a
            href={company.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition"
          >
            <ExternalLink className="w-4 h-4" />
            Wystaw opinię na Google
          </a>
          <button
            onClick={() => setRating(0)}
            className="text-xs text-slate-400 mt-3 underline block mx-auto"
          >
            Zmień ocenę
          </button>
        </div>
      )}

      {rating > 0 && rating <= 3 && !feedbackSent && (
        <form onSubmit={handlePrivateFeedbackSubmit}>
          <h3 className="font-semibold text-slate-800 text-sm mb-1">
            Przepraszamy! Co możemy poprawić?
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Twoja opinia trafi bezpośrednio do właściciela.
          </p>

          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Opisz, co poszło nie tak..."
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white mb-2"
          />

          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Twój e-mail lub nr tel. (opcjonalnie)"
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white mb-3"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 px-4 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij prywatną opinię'}
          </button>

          <button
            type="button"
            onClick={() => setRating(0)}
            className="text-xs text-slate-400 mt-2 underline block mx-auto"
          >
            Anuluj
          </button>
        </form>
      )}

      {feedbackSent && (
        <div className="text-center py-4">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">Dziękujemy za wiadomość!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Przekazaliśmy Twoje uwagi kierownictwu.
          </p>
        </div>
      )}
    </div>
  );
}
