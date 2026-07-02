// Build a Mongo update document from a GraphQL update input.
//
// GraphQL distinguishes three cases we care about:
//   - key absent (undefined): leave the stored value untouched
//   - key present and null:    the client is clearing the field -> $unset
//   - key present with value:  set the new value -> $set
//
// This lets clients clear optional fields (e.g. a date) by sending null,
// instead of the value silently sticking around.
export function buildUpdateDoc(input) {
  const $set = {};
  const $unset = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined) continue;
    if (value === null) {
      $unset[key] = '';
    } else {
      $set[key] = value;
    }
  }
  const update = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  return update;
}
