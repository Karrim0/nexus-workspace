import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const LOGIN_PADDING_SALT = "nexus-login-padding-v1";

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scrypt(
    password,
    salt,
    KEY_LENGTH
  )) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const storedKey = Buffer.from(hash, "hex");

  if (storedKey.length !== KEY_LENGTH) {
    return false;
  }

  const derivedKey = (await scrypt(
    password,
    salt,
    KEY_LENGTH
  )) as Buffer;

  return timingSafeEqual(storedKey, derivedKey);
}

export async function burnPasswordVerification(
  password: string
) {
  await scrypt(
    password,
    LOGIN_PADDING_SALT,
    KEY_LENGTH
  );

  return false;
}
