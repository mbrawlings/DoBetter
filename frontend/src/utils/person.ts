export type PersonBioFields = {
  firstName: string;
  lastName: string;
  city: string;
  employer: string;
  workRole: string;
  relationship: string;
  birthDate: string;
  interests: string[];
};

export function buildPersonInput(fields: PersonBioFields) {
  const input: any = {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
  };
  if (fields.city) input.city = fields.city;
  if (fields.employer) input.employer = fields.employer;
  if (fields.workRole) input.workRole = fields.workRole;
  if (fields.relationship) input.relationship = fields.relationship;
  if (fields.birthDate) input.birthDate = fields.birthDate;
  input.interests = fields.interests;
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
  });
}
