import Person from '../../db/models/person.js';

export function touchPerson(personId, orgId) {
  if (!personId) return Promise.resolve();
  return Person.updateOne({ _id: personId, orgId }, { $currentDate: { updatedAt: true } });
}
