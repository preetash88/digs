import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/profile");
  return (
    <>
      <Header />
      <main className="wrap narrow-page">
        <h1>Edit your profile</h1>
        <p className="muted">This is what other Digs members see when they click your name.</p>
        <ProfileEditForm
          name={user.name ?? ""}
          bio={user.bio ?? null}
          phone={user.phone ?? null}
          idVerified={user.idVerified}
        />
      </main>
      <Footer />
    </>
  );
}
