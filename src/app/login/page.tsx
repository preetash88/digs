import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return (
        <>
            <Header />
            <AuthShell
                eyebrow="Welcome back"
                title="Log in to Digs"
                sub="Pick up where you left off."
                footer={<>New to Digs? <Link href="/signup">Create an account</Link></>}
            >
                <AuthForm mode="login" next={next} />
            </AuthShell>
            <Footer />
        </>
    );
}