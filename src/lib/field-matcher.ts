import type { SerializableField } from "@/types/fill";
import type { ProfileData, ProfileFieldKey } from "@/types/profile";

export interface MatchCandidate {
  fieldKey: ProfileFieldKey;
  confidence: number;
}

type Rule = {
  key: ProfileFieldKey;
  weight: number;
  patterns: RegExp[];
};

const RULES: Rule[] = [
  { key: "email", weight: 1, patterns: [/e-?mail/, /\bemail\b/] },
  { key: "phone", weight: 1, patterns: [/phone/, /mobile/, /tel\b/, /contact.?number/] },
  { key: "firstName", weight: 0.95, patterns: [/first.?name/, /given.?name/, /\bfname\b/] },
  { key: "lastName", weight: 0.95, patterns: [/last.?name/, /family.?name/, /surname/, /\blname\b/] },
  { key: "fullName", weight: 0.9, patterns: [/^name$/, /full.?name/, /\bdisplay.?name\b/] },
  { key: "company", weight: 0.9, patterns: [/company/, /organization/, /employer/] },
  { key: "jobTitle", weight: 0.9, patterns: [/job.?title/, /position/, /role\b/] },
  { key: "website", weight: 0.85, patterns: [/website/, /url\b/, /portfolio/] },
  { key: "addressLine1", weight: 0.95, patterns: [/address.?line.?1/, /street.?address/, /\baddress\b/, /addr1/] },
  { key: "addressLine2", weight: 0.9, patterns: [/address.?line.?2/, /apt/, /suite/, /addr2/] },
  { key: "city", weight: 0.95, patterns: [/city/, /locality/, /town\b/] },
  { key: "state", weight: 0.9, patterns: [/state/, /province/, /region\b/] },
  { key: "postalCode", weight: 0.95, patterns: [/zip/, /postal/, /post.?code/] },
  { key: "country", weight: 0.95, patterns: [/country/, /nation\b/] },
  { key: "dateOfBirth", weight: 0.9, patterns: [/date.?of.?birth/, /\bdob\b/, /birthday/] },
  { key: "linkedIn", weight: 0.85, patterns: [/linkedin/] },
  { key: "github", weight: 0.85, patterns: [/github/] },
  { key: "bio", weight: 0.8, patterns: [/bio/, /about.?you/, /summary/, /description/] },
];

const AUTOCOMPLETE_MAP: Record<string, ProfileFieldKey> = {
  email: "email",
  tel: "phone",
  "given-name": "firstName",
  "family-name": "lastName",
  name: "fullName",
  "street-address": "addressLine1",
  "address-line1": "addressLine1",
  "address-line2": "addressLine2",
  "address-level2": "city",
  "address-level1": "state",
  "postal-code": "postalCode",
  country: "country",
  "organization": "company",
  "organization-title": "jobTitle",
  url: "website",
  bday: "dateOfBirth",
};

export function matchField(
  field: SerializableField,
  data: ProfileData,
): MatchCandidate | null {
  const ac = field.autocomplete.replace(/^section-\w+\s+/i, "").trim();
  if (ac && AUTOCOMPLETE_MAP[ac]) {
    const key = AUTOCOMPLETE_MAP[ac];
    if (data[key]) return { fieldKey: key, confidence: 0.98 };
  }

  const haystack = field.hints;
  let best: MatchCandidate | null = null;

  for (const rule of RULES) {
    if (!data[rule.key]) continue;
    for (const pattern of rule.patterns) {
      if (pattern.test(haystack)) {
        const confidence = rule.weight;
        if (!best || confidence > best.confidence) {
          best = { fieldKey: rule.key, confidence };
        }
        break;
      }
    }
  }

  if (field.type === "email" && data.email) {
    return { fieldKey: "email", confidence: 0.99 };
  }
  if (field.type === "tel" && data.phone) {
    return { fieldKey: "phone", confidence: 0.99 };
  }

  return best;
}
