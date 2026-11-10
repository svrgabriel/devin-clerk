import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { appConfig } from "@/app.config";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <SignUp
          appearance={{
            variables: { colorPrimary: appConfig.accent },
          }}
        />
      </Suspense>
    </div>
  );
}
