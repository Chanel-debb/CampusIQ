import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import type { University } from "@/types";

export function UniversityCard({ university }: { university: University }) {
  return (
    <Link href={`/universities/${university.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">{university.name}</h3>
            <Badge tone="neutral">{university.province}</Badge>
          </div>

          <p className="text-sm text-slate-500">{university.city}</p>

          <div className="mt-auto flex items-center justify-between text-sm text-slate-600">
            <span>
              ⭐ {Number(university.avg_rating).toFixed(1)} ({university.total_reviews} reviews)
            </span>
            {university.ranking_national && <span>#{university.ranking_national} nationally</span>}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
