import Link from "next/link";
import { auth } from "@/auth";
import { unreadCount } from "@/lib/messaging";
import type { Country } from "@/db/schema";
import { Icon } from "./Icon";

export async function Header({ country }: { country?: Country }) {
  const session = await auth();
  const user = session?.user;
  const unread = user?.id ? await unreadCount(user.id) : 0;
  const c = country ?? "AU";
  return (
    <header className="top">
      <div className="wrap bar">
        <Link className="logo" href={`/?country=${c}`} aria-label="Digs home">digs<i /></Link>
        <span className="spacer" />
        <div className="region" role="group" aria-label="Country">
          <Link href="/?country=AU" aria-current={c === "AU"}>AU</Link>
          <Link href="/?country=NZ" aria-current={c === "NZ"}>NZ</Link>
        </div>
        <Link className="hostlink" href="/post"><Icon name="plus" size={16} /> Post a free ad</Link>
        {user ? (
          <>
            <Link className="navlink" href="/saved">Saved</Link>
            <Link className="navlink" href="/messages">
              Messages{unread > 0 && <span className="dot">{unread}</span>}
            </Link>
            <Link className="navlink" href="/account">{user.name?.split(" ")[0]}</Link>
            <form action="/api/auth/signout" method="post">
              <button className="navlink linklike" type="submit">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link className="navlink" href="/login">Log in</Link>
            <Link className="btn primary small" href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}