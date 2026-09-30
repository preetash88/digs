import { z } from "zod";
import { AMENITIES, FEATURES } from "./places";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Write a message first").max(2000, "That message is too long"),
});

export const startConversationSchema = messageSchema.extend({
  listingId: z.string().min(1),
});

const amenityKeys = AMENITIES.map((a) => a[0]) as string[];
const featureKeys = FEATURES.map((f) => f[0]) as string[];

const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const int = (min: number, max: number, msg: string) =>
  z.coerce.number({ message: msg }).int(msg).min(min, msg).max(max, msg);

export const listingSchema = z.object({
  kind: z.enum(["room", "whole", "short", "wanted"]),
  country: z.enum(["AU", "NZ"]),
  city: z.string().trim().min(2, "Choose a city"),
  suburb: z.string().trim().min(2, "Enter a suburb").max(60),
  title: z.string().trim().min(8, "Give your ad a longer title").max(90, "Title is too long"),
  description: z.string().trim().min(30, "Please write at least 30 characters").max(3000),
  rent: int(1, 50000, "Enter a rent between $1 and $50,000"),
  bedrooms: int(0, 20, "Bedrooms must be 0 to 20").default(1),
  bathrooms: int(0, 20, "Bathrooms must be 0 to 20").default(1),
  housemates: int(0, 20, "Housemates must be 0 to 20").default(0),
  maxGuests: int(1, 30, "Guests must be 1 to 30").default(2),
  billsIncluded: bool,
  furnished: bool,
  petsOk: bool,
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date").optional().or(z.literal("")),
  amenities: z.array(z.string()).transform((a) => a.filter((x) => amenityKeys.includes(x))),
  features: z.array(z.string()).transform((a) => a.filter((x) => featureKeys.includes(x))),
});

const blankToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);
const flag = z.preprocess((v) => v === "1" || v === "on" || v === "true" || v === true, z.boolean()).catch(false);
const optInt = (min: number, max: number) =>
  z.preprocess(blankToUndef, z.coerce.number().int().min(min).max(max).optional()).catch(undefined);

export const searchSchema = z.object({
  country: z.enum(["AU", "NZ"]).catch("AU"),
  kind: z.enum(["room", "whole", "short", "wanted"]).catch("room"),
  city: z.preprocess(blankToUndef, z.string().trim().max(60).optional()).catch(undefined),
  q: z.preprocess(blankToUndef, z.string().trim().max(80).optional()).catch(undefined),
  min: optInt(0, 100000),
  max: optInt(0, 100000),
  guests: optInt(1, 30),
  beds: optInt(1, 10),
  baths: optInt(1, 10),
  cat: z.preprocess(blankToUndef, z.string().regex(/^[a-z]{2,12}$/).optional()).catch(undefined),
  // amenities arrive as a comma separated string: "wifi,kitchen"
  am: z
    .preprocess(blankToUndef, z.string().max(200).optional())
    .catch(undefined)
    .transform((v) => (v ? v.split(",").filter((x) => amenityKeys.includes(x)) : [])),
  bills: flag,
  furnished: flag,
  pets: flag,
  verified: flag,
  view: z.enum(["list", "map"]).catch("list"),
  sort: z.enum(["new", "lo", "hi"]).catch("new"),
  page: z.coerce.number().int().min(1).max(500).catch(1),
});
export type SearchInput = z.infer<typeof searchSchema>;

// Turns URL params (which may repeat, like am=wifi&am=kitchen) into one plain object.
export function paramsToObject(sp: URLSearchParams | Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  const entries = sp instanceof URLSearchParams ? [...new Set(sp.keys())].map((k) => [k, sp.getAll(k)] as const) : Object.entries(sp);
  for (const [k, v] of entries) {
    if (v === undefined) continue;
    const arr = Array.isArray(v) ? v : [v];
    out[k] = k === "am" ? arr.join(",") : arr[0];
  }
  return out;
}

// The reverse: a URL query string that reproduces a search, with some values changed.
export function searchToQuery(p: SearchInput, changes: Record<string, string | undefined> = {}) {
  const base: Record<string, string | undefined> = {
    country: p.country, kind: p.kind, city: p.city, q: p.q,
    min: p.min?.toString(), max: p.max?.toString(), guests: p.guests?.toString(),
    beds: p.beds?.toString(), baths: p.baths?.toString(), cat: p.cat,
    am: p.am.length ? p.am.join(",") : undefined,
    bills: p.bills ? "1" : undefined, furnished: p.furnished ? "1" : undefined,
    pets: p.pets ? "1" : undefined, verified: p.verified ? "1" : undefined,
    view: p.view === "map" ? "map" : undefined, sort: p.sort === "new" ? undefined : p.sort,
  };
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...changes })) if (v) q.set(k, v);
  return q.toString();
}

export function activeFilterCount(p: SearchInput) {
  return [p.min, p.max, p.beds, p.baths, p.bills, p.furnished, p.pets, p.verified].filter(Boolean).length + p.am.length;
}
