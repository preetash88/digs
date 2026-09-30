import { db } from "@/db";
import { listingPhotos, listings } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";
import { countListings, searchListings } from "@/lib/listings";
import { cityCentre } from "@/lib/places";
import { scamSignals } from "@/lib/scam";
import { saveImage } from "@/lib/storage";
import { listingSchema, paramsToObject, searchSchema } from "@/lib/validators";
import { hash } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/listings?country=AU&kind=room&city=Sydney&max=400
export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  const input = searchSchema.parse(paramsToObject(sp));
  // ?countOnly=1 is used by the filters panel to show "Show N places" live.
  if (sp.get("countOnly")) return Response.json({ total: await countListings(input) });
  const result = await searchListings(input);
  return Response.json({
    total: result.total,
    items: result.items.map(({ listing, photos, rating, reviewCount }) => ({
      ...listing,
      photo: photos[0] ?? null,
      photos,
      rating,
      reviewCount,
    })),
  });
});

const field = (form: FormData, key: string) => form.get(key) ?? undefined;

// POST /api/listings  (multipart form: fields + up to 6 "photos")
export const POST = handle(async (req) => {
  const user = await requireUser();
  const form = await req.formData();

  const input = listingSchema.parse({
    kind: field(form, "kind"),
    country: field(form, "country"),
    city: field(form, "city"),
    suburb: field(form, "suburb"),
    title: field(form, "title"),
    description: field(form, "description"),
    rent: field(form, "rent"),
    bedrooms: field(form, "bedrooms"),
    bathrooms: field(form, "bathrooms"),
    housemates: field(form, "housemates"),
    maxGuests: field(form, "maxGuests"),
    billsIncluded: field(form, "billsIncluded"),
    furnished: field(form, "furnished"),
    petsOk: field(form, "petsOk"),
    availableFrom: field(form, "availableFrom"),
    amenities: form.getAll("amenities").map(String),
    features: form.getAll("features").map(String),
  });

  const centre = cityCentre(input.country, input.city);
  if (!centre) throw new HttpError(400, "Choose a city from the list");

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 6) throw new HttpError(400, "You can upload up to 6 photos");
  const urls = await Promise.all(files.map(saveImage));

  // Spread pins around the city centre so the map isn't a single dot (stand-in for real geocoding).
  const h = hash(input.suburb.toLowerCase());
  const lat = centre.lat + (((h % 1000) / 1000) - 0.5) * 0.12;
  const lng = centre.lng + ((((h >> 10) % 1000) / 1000) - 0.5) * 0.14;

  const flags = scamSignals(`${input.title} ${input.description}`);

  const [row] = await db
    .insert(listings)
    .values({
      ownerId: user.id,
      kind: input.kind,
      country: input.country,
      city: input.city,
      suburb: input.suburb,
      title: input.title,
      description: input.description,
      rentCents: input.rent * 100,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      housemates: input.housemates,
      maxGuests: input.maxGuests,
      billsIncluded: input.billsIncluded,
      furnished: input.furnished,
      petsOk: input.petsOk,
      availableFrom: input.availableFrom || null,
      amenities: input.amenities,
      features: input.features,
      lat,
      lng,
      status: flags.length ? "pending" : "active",
    })
    .returning({ id: listings.id, status: listings.status });

  if (urls.length) {
    await db.insert(listingPhotos).values(urls.map((url, position) => ({ listingId: row.id, url, position })));
  }
  // Never tell the poster which rule fired, or scammers learn how to dodge it.
  return Response.json({ id: row.id, status: row.status }, { status: 201 });
});
