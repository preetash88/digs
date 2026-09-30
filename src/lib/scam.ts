// A very simple first line of defence. Real moderation (image checks, ID checks,
// human review) comes later; this just sends suspicious ads to a review queue.
const SIGNALS: [RegExp, string][] = [
  [/western\s*union|moneygram/i, "asks for a money transfer service"],
  [/gift\s*cards?|bitcoin|crypto|usdt/i, "asks for gift cards or crypto"],
  [/(pay|send).{0,30}(deposit|bond).{0,30}(before|without).{0,20}(view|inspect|seeing)/i, "asks for payment before inspecting"],
  [/whats\s*app|telegram|signal me/i, "moves the chat off the platform"],
  [/i('| a)m (currently )?(abroad|overseas|out of the country)/i, "host is overseas"],
];

export function scamSignals(text: string) {
  return SIGNALS.filter(([re]) => re.test(text)).map(([, why]) => why);
}
