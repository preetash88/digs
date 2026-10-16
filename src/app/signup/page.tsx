import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return (
        <>
            <Header />
            <AuthShell
                eyebrow="Join Digs"
                title="Create your account"
                sub="Free for renters and hosts."
                footer={<>Already have an account? <Link href="/login">Log in</Link></>}
            >
                <AuthForm mode="signup" next={next} />
            </AuthShell>
            <Footer />
        </>
    );
}