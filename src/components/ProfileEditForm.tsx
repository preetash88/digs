"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { name: string; bio: string | null; phone: string | null; idVerified: boolean };

export function ProfileEditForm({ name, bio, phone, idVerified }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (res.ok) { router.refresh(); }
    else { setError((await res.json()).error ?? "Something went wrong"); }
    setBusy(false);
  }

  async function startVerify() {
    setVerifying(true); setVerifyMsg("");
    const res = await fetch("/api/users/me/verify-id", { method: "POST" });
    const j = await res.json();
    if (res.ok) {
      setVerifyMsg(j.already ? "Your ID is already verified." : "✓ ID verified! The badge is now showing on your profile.");
      router.refresh();
    } else {
      setVerifyMsg(j.error ?? "Something went wrong");
    }
    setVerifying(false);
  }

  return (
    <div className="profile-edit">
      <form className="card-form" onSubmit={save}>
        <label>Display name<input name="name" defaultValue={name} required minLength={2} maxLength={80} /></label>
        <label>
          Bio <span className="muted">(shown on your profile)</span>
          <textarea name="bio" defaultValue={bio ?? ""} maxLength={600} rows={4}
            placeholder="Tell people a bit about yourself — where you're from, what you do, what you're like as a housemate." />
        </label>
        <label>Phone number <span className="muted">(private, for hosts only)</span>
          <input name="phone" defaultValue={phone ?? ""} type="tel" maxLength={30} placeholder="+61 400 000 000" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
      </form>

      <div className="verify-block">
        <h3>ID verification</h3>
        {idVerified ? (
          <p className="badge-large verified"><span>✓</span> ID verified — your badge is live</p>
        ) : (
          <>
            <p className="muted">Verified hosts get more enquiries. We check your name matches a government ID.</p>
            <button className="btn dark" onClick={startVerify} disabled={verifying}>
              {verifying ? "Starting..." : "Verify my ID"}
            </button>
            {verifyMsg && <p className="fine2" style={{ textAlign: "left", marginTop: 10 }}>{verifyMsg}</p>}
          </>
        )}
      </div>
    </div>
  );
}
