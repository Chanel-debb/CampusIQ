"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Program } from "@/types";

const reviewSchema = z.object({
  program: z.string().optional(),
  overall_rating: z.string(),
  teaching_rating: z.string(),
  career_support_rating: z.string(),
  body: z.string().min(10, "Please write at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export function ReviewForm({
  universityId,
  universitySlug,
  programs,
}: {
  universityId: string;
  universitySlug: string;
  programs: Program[];
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { overall_rating: "5", teaching_rating: "5", career_support_rating: "5" },
  });

  const mutation = useMutation({
    mutationFn: async (values: ReviewFormValues) =>
      api.post("/api/reviews/", {
        university: universityId,
        program: values.program || null,
        overall_rating: Number(values.overall_rating),
        teaching_rating: Number(values.teaching_rating),
        career_support_rating: Number(values.career_support_rating),
        body: values.body,
      }),
    onSuccess: () => {
      setSubmitted(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ["university-reviews", universitySlug] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const firstError = message ? Object.values(message).flat()[0] : undefined;
      setServerError(firstError || "Couldn't submit your review. Please try again.");
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    setServerError(null);
    mutation.mutate(values);
  };

  if (submitted) {
    return (
      <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
        Thanks! Your review has been submitted and is pending approval.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {programs.length > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="program" className="text-sm font-medium text-slate-700">
            Program (optional)
          </label>
          <select
            id="program"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            defaultValue=""
            {...register("program")}
          >
            <option value="">Not program-specific</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["overall_rating", "Overall"],
            ["teaching_rating", "Teaching"],
            ["career_support_rating", "Career support"],
          ] as const
        ).map(([field, label]) => (
          <div key={field} className="flex flex-col gap-1">
            <label htmlFor={field} className="text-sm font-medium text-slate-700">
              {label}
            </label>
            <select
              id={field}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register(field)}
            >
              {RATING_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="body" className="text-sm font-medium text-slate-700">
          Your review
        </label>
        <textarea
          id="body"
          rows={4}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          {...register("body")}
        />
        {errors.body && <span className="text-xs text-red-600">{errors.body.message}</span>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Submit review
      </Button>
    </form>
  );
}
