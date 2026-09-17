"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { UniversityCard } from "@/components/university/UniversityCard";
import { api } from "@/lib/api";
import { PROVINCES } from "@/lib/constants";
import type { University } from "@/types";

const MIN_RATINGS = [1, 2, 3, 4, 5];

export default function UniversitiesPage() {
  const [province, setProvince] = useState("all");
  const [minRating, setMinRating] = useState("any");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["universities", province, minRating],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (province !== "all") params.province = province;
      if (minRating !== "any") params.min_rating = minRating;
      const { data } = await api.get<University[]>("/api/universities/", { params });
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">University Finder</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Search universities by province and rating to find the right fit.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          value={province}
          onChange={(event) => setProvince(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
        >
          <option value="all">All provinces</option>
          {PROVINCES.map((prov) => (
            <option key={prov.value} value={prov.value}>
              {prov.label}
            </option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(event) => setMinRating(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
        >
          <option value="any">Any rating</option>
          {MIN_RATINGS.map((rating) => (
            <option key={rating} value={rating}>
              {rating}+ stars
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="mt-8 text-red-600">Couldn&apos;t load universities. Try again shortly.</p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="mt-8 text-slate-500 dark:text-slate-300">No universities match your filters.</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((university) => (
          <UniversityCard key={university.id} university={university} />
        ))}
      </div>
    </div>
  );
}
