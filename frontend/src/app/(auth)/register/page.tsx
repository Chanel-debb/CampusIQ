"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PROVINCES, USER_ROLES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "parent", "counselor"]),
  province: z.string().optional(),
  grad_year: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        ...values,
        grad_year: values.grad_year ? Number(values.grad_year) : undefined,
      });
      router.push("/");
    } catch {
      setServerError("Couldn't create your account. That email may already be in use.");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Join CampusIQ to save reviews, quiz results, and chat history.
      </p>

      <Card className="mt-6">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="full_name"
              label="Full name"
              autoComplete="name"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a
              </label>
              <select
                id="role"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                {...register("role")}
              >
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="province" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Province (optional)
              </label>
              <select
                id="province"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                defaultValue=""
                {...register("province")}
              >
                <option value="">Select a province</option>
                {PROVINCES.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="grad_year"
              type="number"
              label="Graduation year (optional)"
              error={errors.grad_year?.message}
              {...register("grad_year")}
            />

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}

            <Button type="submit" isLoading={isSubmitting} className="mt-2">
              Sign up
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
