import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { appConfig } from "@/app.config";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <SignIn
          appearance={{
            variables: { colorPrimary: appConfig.accent },
          }}
        />
      </Suspense>
    </div>
  );
}
