import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_ENABLED } from "@/lib/auth-flags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const logoUrl = "/__l5e/assets-v1/8edbf182-d474-40db-a40e-0126d36842f3/oktapod-logo-transparent.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — OCTAPOD" },
      {
        name: "description",
        content:
          "Sign in to OCTAPOD to see tenders and early signals scored against your organization profile.",
      },
      { property: "og:title", content: "Sign in — OCTAPOD" },
      {
        property: "og:description",
        content: "Access your organization's tender and market intelligence workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    if (!AUTH_ENABLED) throw redirect({ to: "/" });
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email must be under 255 characters" });

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be under 72 characters" });

const orgNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Organization name is required" })
  .max(120, { message: "Organization name must be under 120 characters" });

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }): string | null {
  return result.success ? null : (result.error?.issues[0]?.message ?? "Invalid input");
}


function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-isoline opacity-70" />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-chart-grid opacity-60" />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoUrl} alt="OCTAPOD" className="h-16 w-auto object-contain" />
          <div className="text-eyebrow mt-3">Tender &amp; market intelligence</div>
          <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-foreground">
            Sign in to OCTAPOD
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Your workspace is scoped to your organization. Only members see its data.
          </p>
        </div>

        <div className="rounded-md border border-hairline bg-surface-1 p-5">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"password" | "magic" | null>(null);

  async function handlePasswordSignIn(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const emailError = firstError(emailSchema.safeParse(email));
    const passwordError = firstError(passwordSchema.safeParse(password));
    if (emailError || passwordError) {
      setError(emailError ?? passwordError);
      return;
    }

    setBusy("password");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(null);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    void navigate({ to: "/", replace: true });
  }

  async function handleMagicLink() {
    setError(null);
    const emailError = firstError(emailSchema.safeParse(email));
    if (emailError) {
      setError(emailError);
      return;
    }

    setBusy("magic");
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Accounts are created through sign-up only, so every account has an organization.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setBusy(null);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    toast.success("Magic link sent", {
      description: "Check your inbox for a sign-in link.",
    });
  }

  return (
    <form onSubmit={handlePasswordSignIn} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Work email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.fi"
          maxLength={255}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={72}
        />
      </div>

      {error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy !== null}>
        {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleMagicLink}
        disabled={busy !== null}
      >
        {busy === "magic" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Email me a magic link
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const orgError = firstError(orgNameSchema.safeParse(orgName));
    const emailError = firstError(emailSchema.safeParse(email));
    const passwordError = firstError(passwordSchema.safeParse(password));
    if (orgError || emailError || passwordError) {
      setError(orgError ?? emailError ?? passwordError);
      return;
    }

    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { organization_name: orgName.trim() },
      },
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      void navigate({ to: "/", replace: true });
      return;
    }
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="rounded-md border border-hairline bg-surface-2/40 px-4 py-5 text-center">
        <Mail className="mx-auto h-5 w-5 text-primary" />
        <div className="mt-2 font-display text-[15px] text-foreground">Confirm your email</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          We sent a confirmation link to <span className="font-mono">{email.trim()}</span>. Your
          organization <span className="text-foreground">{orgName.trim()}</span> is created when you
          confirm.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="signup-org">Organization name</Label>
        <Input
          id="signup-org"
          type="text"
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Your company"
          maxLength={120}
        />
        <p className="text-[11px] text-subtle-foreground">
          Required. You become its owner and can rename it in Settings.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Work email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.fi"
          maxLength={255}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={72}
        />
        <p className="text-[11px] text-subtle-foreground">At least 8 characters.</p>
      </div>

      {error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
