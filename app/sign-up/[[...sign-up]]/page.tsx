import { SignUp } from "@clerk/nextjs";
import { AuthFrame } from "@/components/auth-frame";

export default function SignUpPage() {
  return (
    <AuthFrame mode="sign-up">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: { colorPrimary: "#000000", colorBackground: "#ffffff", borderRadius: "0.875rem" },
          elements: { rootBox: "w-full", cardBox: "w-full shadow-none", card: "w-full border border-[#e2e2df] shadow-[0_24px_70px_rgba(0,0,0,0.12)]" },
        }}
      />
    </AuthFrame>
  );
}
