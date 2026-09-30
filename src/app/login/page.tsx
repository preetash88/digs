import Link from "next/link";
import { Header } from "@/components/Header";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <Header />
      <main className="wrap auth">
        <h1>Welcome back</h1>
        <AuthForm mode="login" next={next} />
        <p className="muted">New to Digs? <Link href="/signup">Create an account</Link></p>
      </main>
    </>
  );
}
