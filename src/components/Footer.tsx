import Link from "next/link";
import { Mark } from "./Mark";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <Mark size={30} />
            <p>Share houses, whole places and short stays across Australia and Aotearoa New Zealand.</p>
          </div>
          <nav aria-label="Find a place">
            <h4>Find</h4>
            <Link href="/?kind=room">Rooms</Link>
            <Link href="/?kind=whole">Whole places</Link>
            <Link href="/?kind=short">Short stays</Link>
            <Link href="/?kind=wanted">Looking for a place</Link>
          </nav>
          <nav aria-label="Host">
            <h4>Host</h4>
            <Link href="/post">Post a free ad</Link>
            <Link href="/account">Your ads</Link>
            <Link href="/messages">Messages</Link>
          </nav>
          <nav aria-label="Regions">
            <h4>Regions</h4>
            <Link href="/?country=AU">Australia</Link>
            <Link href="/?country=NZ">Aotearoa New Zealand</Link>
          </nav>
        </div>
        <div className="foot-mark" aria-hidden="true">Digs</div>
        <p className="fine">Digs is a working name. Sample listings are for development only.</p>
      </div>
    </footer>
  );
}
