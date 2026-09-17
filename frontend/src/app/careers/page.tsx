"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CareerCard } from "@/components/career/CareerCard";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Career } from "@/types";

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["careers"],
    queryFn: async () => {
      const { data } = await api.get<Career[]>("/api/careers/");
      return data;
    },
  });

  const categories = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    for (const career of data) {
      if (career.category) seen.set(career.category.slug, career.category.name);
    }
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((career) => {
      const matchesSearch = career.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || career.category?.slug === category;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Career Explorer</h1>
      <p className="mt-1 text-slate-600">
        Browse careers with real salary ranges, job outlook, and required skills.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search careers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
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
        <p className="mt-8 text-red-600">Couldn&apos;t load careers. Try again shortly.</p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="mt-8 text-slate-500">No careers match your search.</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((career) => (
          <CareerCard key={career.id} career={career} />
        ))}
      </div>
    </div>
  );
}
