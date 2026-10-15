import type { Country } from "@/db/schema";
import { HeroPhotos } from "./HeroPhotos";

export function Landscape({ country }: { country: Country }) {
    return (
        <div className="landscape" aria-hidden="true">
            <HeroPhotos country={country} />
        </div>
    );
}