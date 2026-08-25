import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Paper Checker</h1>
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
    </main>
  );
}
