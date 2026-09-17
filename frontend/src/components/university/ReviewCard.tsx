import { Card, CardBody } from "@/components/ui/Card";
import type { Review } from "@/types";

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5`} className="text-amber-500">
      {"★".repeat(value)}
      <span className="text-slate-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-900">{review.user.full_name || "Anonymous"}</p>
          <Stars value={review.overall_rating} />
        </div>
        <p className="mt-2 text-sm text-slate-700">{review.body}</p>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span>Teaching: {review.teaching_rating}/5</span>
          <span>Career support: {review.career_support_rating}/5</span>
        </div>
      </CardBody>
    </Card>
  );
}
