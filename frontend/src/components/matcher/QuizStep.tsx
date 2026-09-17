import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface QuizStepProps {
  question: QuizQuestion;
  selected?: string;
  onSelect: (value: string) => void;
}

export function QuizStep({ question, selected, onSelect }: QuizStepProps) {
  return (
    <Card>
      <CardBody>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {question.question}
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                selected === option.value
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:text-slate-300"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
