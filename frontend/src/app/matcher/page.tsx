"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProgressBar } from "@/components/matcher/ProgressBar";
import { QuizStep } from "@/components/matcher/QuizStep";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { MatchResult, QuizQuestion } from "@/types";

const SESSION_KEY_STORAGE = "matcher_session_key";

export default function MatcherPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: questions, isLoading } = useQuery({
    queryKey: ["matcher-questions"],
    queryFn: async () => {
      const { data } = await api.get<QuizQuestion[]>("/api/matcher/questions/");
      return data;
    },
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const existingSessionKey = localStorage.getItem(SESSION_KEY_STORAGE) || undefined;
      const { data } = await api.post<MatchResult>("/api/matcher/run/", {
        quiz_answers: answers,
        session_key: existingSessionKey,
      });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem(SESSION_KEY_STORAGE, data.session_key);
      router.push("/matcher/results");
    },
  });

  if (isLoading || !questions) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const currentQuestion = questions[stepIndex];
  const isLastStep = stepIndex === questions.length - 1;
  const hasAnsweredCurrent = Boolean(answers[currentQuestion.id]);

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      runMutation.mutate();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Program Matcher</h1>
      <p className="mt-1 text-slate-600">
        Answer a few questions about your interests and strengths to get personalized matches.
      </p>

      <div className="mt-6">
        <ProgressBar current={stepIndex} total={questions.length} />
      </div>

      <div className="mt-6">
        <QuizStep
          question={currentQuestion}
          selected={answers[currentQuestion.id]}
          onSelect={handleSelect}
        />
      </div>

      {runMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          Something went wrong running the matcher. Please try again.
        </p>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          isLoading={isLastStep && runMutation.isPending}
        >
          {isLastStep ? "See my matches" : "Next"}
        </Button>
      </div>
    </div>
  );
}
