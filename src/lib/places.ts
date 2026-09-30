import type { Country } from "@/db/schema";

export const COUNTRIES: Record<Country, { name: string; currency: string }> = {
  AU: { name: "Australia", currency: "AUD" },
  NZ: { name: "New Zealand", currency: "NZD" },
};

export const CITIES: Record<Country, { name: string; lat: number; lng: number }[]> = {
  AU: [
    { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
    { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
    { name: "Perth", lat: -31.9505, lng: 115.8605 },
    { name: "Adelaide", lat: -34.9285, lng: 138.6007 },
    { name: "Canberra", lat: -35.2809, lng: 149.13 },
    { name: "Gold Coast", lat: -28.0167, lng: 153.4 },
    { name: "Hobart", lat: -42.8821, lng: 147.3272 },
  ],
  NZ: [
    { name: "Auckland", lat: -36.8485, lng: 174.7633 },
    { name: "Wellington", lat: -41.2866, lng: 174.7756 },
    { name: "Christchurch", lat: -43.5321, lng: 172.6362 },
    { name: "Dunedin", lat: -45.8788, lng: 170.5028 },
    { name: "Hamilton", lat: -37.787, lng: 175.279 },
    { name: "Tauranga", lat: -37.6878, lng: 176.1651 },
    { name: "Queenstown", lat: -45.0312, lng: 168.6626 },
  ],
};

export function cityCentre(country: Country, city: string) {
  return CITIES[country].find((c) => c.name === city) ?? null;
}

export const AMENITIES = [
  ["wifi", "Wifi"],
  ["kitchen", "Kitchen"],
  ["washer", "Washer"],
  ["aircon", "Air con"],
  ["heat", "Heating"],
  ["parking", "Parking"],
  ["work", "Desk"],
] as const;

// "Features" power the category bar on the home page.
export const FEATURES = [
  ["beach", "Beachfront"],
  ["uni", "Near uni"],
  ["city", "City views"],
  ["garden", "Garden"],
  ["pool", "Pool"],
  ["transit", "Near transit"],
  ["bike", "Bike friendly"],
  ["quiet", "Quiet street"],
  ["ensuite", "Ensuite"],
] as const;

// Extra categories that map to yes/no columns rather than the features list.
export const FLAG_CATEGORIES = [
  ["furn", "Furnished"],
  ["bills", "Bills included"],
  ["pets", "Pet friendly"],
] as const;

export const KINDS = [
  ["room", "Rooms"],
  ["whole", "Whole places"],
  ["short", "Short stays"],
  ["wanted", "Looking for a place"],
] as const;
