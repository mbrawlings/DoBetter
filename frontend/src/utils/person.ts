import { normalizeTags } from './tags';

export type PersonBioFields = {
  firstName: string;
  lastName: string;
  city: string;
  employer: string;
  workRole: string;
  relationship: string;
  birthDate: string;
  interests: string[];
  tags: string[];
  background: string;
};

/** GraphQL `UpcomingEventInput` — never include Apollo cache fields like `__typename`. */
export type UpcomingEventInput = {
  title: string;
  date?: string;
  endDate?: string;
  startsAt?: string;
  notes?: string;
};

type UpcomingEventLike = {
  title?: string | null;
  date?: string | null;
  endDate?: string | null;
  startsAt?: string | null;
  notes?: string | null;
};

export function toUpcomingEventInput(event: UpcomingEventLike): UpcomingEventInput {
  const input: UpcomingEventInput = { title: (event.title ?? '').trim() };
  if (event.date) input.date = event.date;
  if (event.endDate) input.endDate = event.endDate;
  if (event.startsAt) input.startsAt = event.startsAt;
  if (event.notes) input.notes = event.notes;
  return input;
}

export function toUpcomingEventInputs(events: UpcomingEventLike[]): UpcomingEventInput[] {
  return events.map(toUpcomingEventInput);
}

export function buildPersonInput(fields: PersonBioFields) {
  const input: any = {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
  };
  if (fields.city) input.city = fields.city;
  if (fields.employer) input.employer = fields.employer;
  if (fields.workRole) input.workRole = fields.workRole;
  if (fields.relationship) input.relationship = fields.relationship;
  input.interests = fields.interests;
  input.tags = normalizeTags(fields.tags);
  // Nullable fields are sent unconditionally (null when empty) so clearing them
  // persists: the backend turns null into a $unset instead of leaving the old value.
  input.birthDate = fields.birthDate || null;
  input.background = fields.background.trim();
  return input;
}

type PersonLike = {
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  employer?: string | null;
  workRole?: string | null;
  relationship?: string | null;
  birthDate?: string | null;
  interests?: string[] | null;
  tags?: string[] | null;
  background?: string | null;
};

// Rebuild the PersonInput from a loaded person record. Used when editing the
// array fields (currentEvents / upcomingEvents) outside the bio form, where the
// backend expects the full input shape.
export function personToInput(person: PersonLike) {
  return buildPersonInput({
    firstName: person.firstName ?? '',
    lastName: person.lastName ?? '',
    city: person.city ?? '',
    employer: person.employer ?? '',
    workRole: person.workRole ?? '',
    relationship: person.relationship ?? '',
    birthDate: person.birthDate ? person.birthDate.split('T')[0] : '',
    interests: Array.isArray(person.interests) ? person.interests : [],
    tags: Array.isArray(person.tags) ? person.tags : [],
    background: person.background ?? '',
  });
}
