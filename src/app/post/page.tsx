import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostForm } from "@/components/PostForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/post");
  return (
    <>
      <Header />
      <main className="wrap narrow-page">
        <h1>Post a free ad</h1>
        <p className="muted">It takes about three minutes. You can pause or delete it any time.</p>
        <PostForm defaultCountry="AU" />
      </main>
      <Footer />
    </>
  );
}
