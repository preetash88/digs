import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

// ─── helpers ──────────────────────────────────────────────────────────────────
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

const bool = (col: string, defaultVal = false) =>
  integer(col, { mode: "boolean" }).notNull().default(defaultVal);

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());

// ─── NextAuth tables ───────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  bio: text("bio"),
  phoneVerified: bool("phone_verified"),
  idVerified: bool("id_verified"),
  role: text("role", { enum: ["host", "seeker", "both"] })
    .notNull()
    .default("both"),
  createdAt: createdAt(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ─── App tables ────────────────────────────────────────────────────────────────
export const listings = sqliteTable(
  "listings",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["room", "whole", "short", "wanted"] }).notNull(),
    country: text("country", { enum: ["AU", "NZ"] }).notNull(),
    city: text("city").notNull(),
    suburb: text("suburb").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    rentCents: integer("rent_cents").notNull(),
    bedrooms: integer("bedrooms").notNull().default(1),
    bathrooms: integer("bathrooms").notNull().default(1),
    housemates: integer("housemates").notNull().default(0),
    maxGuests: integer("max_guests").notNull().default(2),
    billsIncluded: bool("bills_included"),
    furnished: bool("furnished"),
    petsOk: bool("pets_ok"),
    availableFrom: text("available_from"),
    minStayWeeks: integer("min_stay_weeks"),
    amenities: text("amenities", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    features: text("features", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    lat: real("lat"),
    lng: real("lng"),
    status: text("status", { enum: ["active", "paused", "pending", "rejected"] })
      .notNull()
      .default("active"),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("listings_search_idx").on(t.country, t.kind, t.status, t.city)],
);

export const listingPhotos = sqliteTable("listing_photos", {
  id: id(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
});

export const favourites = sqliteTable(
  "favourites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })],
);

export const conversations = sqliteTable(
  "conversations",
  {
    id: id(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    seekerId: text("seeker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hostId: text("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("conversations_unique").on(t.listingId, t.seekerId)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.createdAt)],
);

export const savedSearches = sqliteTable("saved_searches", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  query: text("query", { mode: "json" })
    .$type<Record<string, string>>()
    .notNull(),
  alertsEnabled: bool("alerts_enabled", true),
  createdAt: createdAt(),
});

export const reviews = sqliteTable("reviews", {
  id: id(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

export const reports = sqliteTable("reports", {
  id: id(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: text("listing_id").references(() => listings.id, {
    onDelete: "cascade",
  }),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["open", "actioned", "dismissed"] })
    .notNull()
    .default("open"),
  createdAt: createdAt(),
});

export const userReviews = sqliteTable(
  "user_reviews",
  {
    id: id(),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    revieweeId: text("reviewee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    role: text("role", { enum: ["host", "seeker"] }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("user_review_unique").on(t.reviewerId, t.revieweeId)],
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type ListingKind = Listing["kind"];
export type Country = Listing["country"];