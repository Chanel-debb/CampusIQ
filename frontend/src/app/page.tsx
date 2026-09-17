import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "Career Explorer",
    description:
      "Browse hundreds of careers with real salary ranges, job outlook, and the skills you'll need to get there.",
    href: "/careers",
    cta: "Explore careers",
  },
  {
    title: "University Finder",
    description:
      "Search universities and programs by province, rating, and tuition to find the right fit for you.",
    href: "/universities",
    cta: "Find a university",
  },
  {
    title: "Program Matcher",
    description:
      "Take a quick quiz about your interests and strengths and get personalized career and program matches.",
    href: "/matcher",
    cta: "Take the quiz",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find the career and university that&apos;s right for you
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          CampusIQ helps high school students explore careers, compare universities and
          programs, and get personalized recommendations — powered by AI.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/matcher">
            <Button size="lg">Take the Program Matcher</Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline">
              Chat with the AI Assistant
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.href}>
              <CardBody className="flex h-full flex-col">
                <h2 className="text-lg font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">{feature.description}</p>
                <Link href={feature.href} className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    {feature.cta}
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
