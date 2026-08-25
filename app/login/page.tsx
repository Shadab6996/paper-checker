import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/LoginForm";
import { HeroPanel } from "@/components/HeroPanel";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await prisma.settings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);
  const studentNames = settings?.heroNames ?? [];
  const quote = settings?.heroQuote || "The best answer sheet is the one that actually gets submitted.";

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="lg:w-1/2">
        <HeroPanel studentNames={studentNames} quote={quote} />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <h2 className="text-xl font-bold text-foreground">Log in</h2>
          </div>
          <div className="mb-8 hidden text-center lg:block">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in to submit or review test answer sheets
            </p>
          </div>
          <Card className="p-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </Card>
        </div>
        <Footer className="mt-auto lg:mt-10" />
      </main>
    </div>
  );
}
