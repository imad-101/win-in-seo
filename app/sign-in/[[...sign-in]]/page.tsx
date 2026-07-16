import { SignIn } from "@clerk/nextjs";
import { AuthFrame } from "@/components/auth-frame";

export default function SignInPage() {
  return (
    <AuthFrame mode="sign-in">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: { colorPrimary: "#000000", colorBackground: "#ffffff", borderRadius: "0.875rem" },
          elements: { rootBox: "w-full", cardBox: "w-full shadow-none", card: "w-full border border-[#e2e2df] shadow-[0_24px_70px_rgba(0,0,0,0.12)]" },
        }}
      />
    </AuthFrame>
  );
}
