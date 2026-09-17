"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ReviewCard } from "@/components/university/ReviewCard";
import { ReviewForm } from "@/components/university/ReviewForm";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { PaginatedResponse, Review, University } from "@/types";

const TABS = ["Overview", "Programs", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function UniversityDetailPage() {
  const params = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("Overview");
  const user = useAuthStore((state) => state.user);

  const {
    data: university,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["university", params.slug],
    queryFn: async () => {
      const { data } = await api.get<University>(`/api/universities/${params.slug}/`);
      return data;
    },
  });

  const { data: reviewsPage, isLoading: reviewsLoading } = useQuery({
    queryKey: ["university-reviews", params.slug],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Review>>(
        `/api/universities/${params.slug}/reviews/`
      );
      return data;
    },
    enabled: tab === "Reviews",
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !university) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-red-600 sm:px-6">University not found.</p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {university.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {university.city}, {university.province}
          </p>
        </div>
        <Badge tone="amber">
          ⭐ {Number(university.avg_rating).toFixed(1)} ({university.total_reviews})
        </Badge>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Overview" && (
          <div className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
            {university.ranking_national && (
              <p>National ranking: #{university.ranking_national}</p>
            )}
            {university.website && (
              <p>
                Website:{" "}
                <a
                  href={university.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {university.website}
                </a>
              </p>
            )}
            <p>{university.programs?.length ?? 0} programs offered.</p>
          </div>
        )}

        {tab === "Programs" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {university.programs && university.programs.length > 0 ? (
              university.programs.map((program) => (
                <Card key={program.id}>
                  <CardBody>
                    <p className="font-medium text-slate-900 dark:text-white">{program.name}</p>
                    <Badge tone="neutral" className="mt-1">
                      {program.degree_type}
                    </Badge>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {program.duration_years} years
                      {program.tuition_domestic && ` · $${program.tuition_domestic}/yr domestic`}
                    </p>
                  </CardBody>
                </Card>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">No programs listed yet.</p>
            )}
          </div>
        )}

        {tab === "Reviews" && (
          <div className="flex flex-col gap-6">
            {user ? (
              <Card>
                <CardBody>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Write a review
                  </h2>
                  <ReviewForm
                    universityId={university.id}
                    universitySlug={university.slug}
                    programs={university.programs ?? []}
                  />
                </CardBody>
              </Card>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Log in
                </Link>{" "}
                to write a review.
              </p>
            )}

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : reviewsPage && reviewsPage.results.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reviewsPage.results.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                <p className="text-xs text-slate-400 dark:text-slate-300">
                  {reviewsPage.count} approved reviews
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">No approved reviews yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
