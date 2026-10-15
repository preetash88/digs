import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <Header />
      <main className="wrap auth">
        <h1>Create your account</h1>
        <p className="muted">Free for renters and hosts.</p>
        <AuthForm mode="signup" next={next} />
        <p className="muted">Already have an account? <Link href="/login">Log in</Link></p>
      </main>
      <Footer />
    </>
  );
}
