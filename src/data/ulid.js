// Tiny ULID generator. 26-char Crockford base32: 10 chars timestamp (48 bits
// of milliseconds since epoch) + 16 chars randomness (80 bits). Time-sortable,
// collision-safe at our scale, no dependency.
//
// See https://github.com/ulid/spec — this implementation prioritises brevity
// over the monotonicity guarantees of the reference impl; HDW logs at most a
// few sets per second, so two distinct IDs in the same millisecond won't
// happen in practice.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomChar() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function encodeTime(now, length) {
  let chars = '';
  let t = now;
  for (let i = 0; i < length; i += 1) {
    chars = ALPHABET[t % 32] + chars;
    t = Math.floor(t / 32);
  }
  return chars;
}

export function ulid(now = Date.now()) {
  let r = '';
  for (let i = 0; i < 16; i += 1) r += randomChar();
  return encodeTime(now, 10) + r;
}
