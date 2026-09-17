"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { JOB_OUTLOOK_TONE } from "@/lib/constants";
import type { Career } from "@/types";

function formatSalary(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `$${value.toLocaleString()}`;
}

export default function CareerDetailPage() {
  const params = useParams<{ slug: string }>();

  const { data: career, isLoading, isError } = useQuery({
    queryKey: ["career", params.slug],
    queryFn: async () => {
      const { data } = await api.get<Career>(`/api/careers/${params.slug}/`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !career) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-red-600 sm:px-6">Career not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{career.title}</h1>
          {career.category && (
            <span className="text-sm font-medium uppercase tracking-wide text-slate-400 dark:text-slate-300">
              {career.category.name}
            </span>
          )}
        </div>
        <Badge tone={JOB_OUTLOOK_TONE[career.job_outlook] ?? "neutral"}>
          {career.job_outlook}
        </Badge>
      </div>

      <p className="mt-6 text-slate-700 dark:text-slate-300">
        {career.description || "No description available."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-300">
              Salary range
            </h2>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {formatSalary(career.salary_min)} – {formatSalary(career.salary_max)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-300">
              Required education
            </h2>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {career.required_education || "Not specified"}
            </p>
          </CardBody>
        </Card>
      </div>

      {career.skills && career.skills.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {career.skills.map((skill) => (
              <Badge key={skill} tone="blue">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Linked programs</h2>
        {career.programs && career.programs.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {career.programs.map((program) => (
              <Link key={program.id} href={`/universities/${program.university_slug}`}>
                <Card className="h-full hover:shadow-md">
                  <CardBody>
                    <p className="font-medium text-slate-900 dark:text-white">{program.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {program.university_name}
                    </p>
                    <Badge tone="neutral" className="mt-2">
                      {program.degree_type}
                    </Badge>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No linked programs yet.</p>
        )}
      </div>
    </div>
  );
}
