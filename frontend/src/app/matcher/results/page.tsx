"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CareerCard } from "@/components/career/CareerCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { MatchResult } from "@/types";

const SESSION_KEY_STORAGE = "matcher_session_key";

export default function MatcherResultsPage() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  useEffect(() => {
    setSessionKey(localStorage.getItem(SESSION_KEY_STORAGE));
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matcher-results", sessionKey],
    queryFn: async () => {
      const { data } = await api.get<MatchResult>(`/api/matcher/results/${sessionKey}/`);
      return data;
    },
    enabled: Boolean(sessionKey),
  });

  if (sessionKey === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-slate-600 dark:text-slate-300">No quiz results found yet.</p>
        <Link href="/matcher" className="mt-4 inline-block">
          <Button>Take the quiz</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="mx-auto max-w-2xl px-4 py-16 text-red-600 sm:px-6">
        Couldn&apos;t load your results. Try retaking the quiz.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your matches</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Based on your answers, here are your top career and program matches.
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Recommended careers
        </h2>
        {data.recommended_careers.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recommended_careers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No career matches found.</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Recommended programs
        </h2>
        {data.recommended_programs.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recommended_programs.map((program) => (
              <Card key={program.id}>
                <CardBody>
                  <p className="font-medium text-slate-900 dark:text-white">{program.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {program.university_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {program.degree_type}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            No program matches found.
          </p>
        )}
      </div>

      <div className="mt-10">
        <Link href="/matcher">
          <Button variant="outline">Retake the quiz</Button>
        </Link>
      </div>
    </div>
  );
}
