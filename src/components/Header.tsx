import Link from "next/link";
import { auth } from "@/auth";
import { unreadCount } from "@/lib/messaging";
import type { Country } from "@/db/schema";
import { Icon } from "./Icon";
import {CountrySwitch} from "@/components/CountrySwitch";

export async function Header({ country, overlay = false }: { country?: Country; overlay?: boolean }) {
  const session = await auth();
  const user = session?.user;
  const unread = user?.id ? await unreadCount(user.id) : 0;
  const c = country ?? "AU";
  return (
      <header className={`top${overlay ? " overlay" : ""}`}>
        <div className="wrap bar">
          <Link className="logo" href={`/?country=${c}`} aria-label="Digs home">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M16 3l3.5 7 7.5 1-5.5 5.3 1.3 7.7L16 21l-6.8 3 1.3-7.7L5 11l7.5-1z"/>
            </svg>
            <div className="logo-text">
              <span className="logo-name">Digs</span>
              <span className="logo-tag">curated stays</span>
            </div>
          </Link>

          <nav className="mainnav" aria-label="Main">
            <Link href={`/?country=${c}&kind=room`}>Rooms</Link>
            <Link href={`/?country=${c}&kind=whole`}>Whole Places</Link>
            <Link href={`/?country=${c}&kind=short`}>Short Stays</Link>
            <Link href={`/?country=${c}&kind=wanted`}>Wanted</Link>
          </nav>

          <div className="bar-right">
            <CountrySwitch country={c} />

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
                </>
            )}

            <Link className="btn-cta" href="/post">
              <Icon name="plus" size={14} /> Post a free ad
            </Link>
          </div>
        </div>
      </header>
  );
}