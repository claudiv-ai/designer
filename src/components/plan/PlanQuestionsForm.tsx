import { useState } from 'react';
import type { PlanQuestion } from '@claudiv/core';
import * as api from '../../lib/api';

interface Props {
  file: string;
  questions: PlanQuestion[];
  onSubmitted?: () => void;
}

/**
 * Visual form for answering plan:questions.
 * Renders question types as native form controls.
 */
export function PlanQuestionsForm({ file, questions, onSubmitted }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      initial[q.question] = q.answer || '';
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(question: string, value: string) {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitPlanAnswers(file, answers);
      onSubmitted?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = questions.every((q) => answers[q.question]?.trim());

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full" />
        <h3 className="text-sm font-medium text-amber-300">Plan Questions</h3>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
          <p className="text-sm text-gray-200 mb-3">{q.question}</p>
          {renderInput(q, answers[q.question] || '', (val) => setAnswer(q.question, val))}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Answers'}
      </button>
    </div>
  );
}

function renderInput(
  question: PlanQuestion,
  value: string,
  onChange: (val: string) => void,
) {
  switch (question.type) {
    case 'yes-no':
      return (
        <div className="flex gap-4">
          {['yes', 'no'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.question}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-300 capitalize">{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.question}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'multi-select':
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const selected = value.split(',').map((s) => s.trim()).filter(Boolean);
            const isChecked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const next = isChecked
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onChange(next.join(', '));
                  }}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-300">{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case 'value':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value..."
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
      );

    case 'open':
    default:
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Type your answer..."
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-y"
        />
      );
  }
}
