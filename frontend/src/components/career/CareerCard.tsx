import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { JOB_OUTLOOK_TONE } from "@/lib/constants";
import type { Career } from "@/types";

function formatSalary(value: number | null): string {
  if (value === null) return "—";
  return `$${value.toLocaleString()}`;
}

export function CareerCard({ career }: { career: Career }) {
  return (
    <Link href={`/careers/${career.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {career.title}
            </h3>
            <Badge tone={JOB_OUTLOOK_TONE[career.job_outlook] ?? "neutral"}>
              {career.job_outlook}
            </Badge>
          </div>

          {career.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-400">
              {career.category.name}
            </span>
          )}

          <p className="mt-auto text-sm text-slate-600 dark:text-slate-300">
            {formatSalary(career.salary_min)} – {formatSalary(career.salary_max)}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
