// zonta-server/src/generateHash.ts

import bcrypt from "bcryptjs";

/**
 * Generates a bcrypt hash for a given password.
 * Run with:
 *   npx tsx src/generateHash.ts
 */
const generateHash = async (): Promise<void> => {
  try {
    const password = "Marcus1"; // change before running
    const hash = await bcrypt.hash(password, 10);

    console.log("Plain Password:", password);
    console.log("Hashed Password:", hash);
  } catch (error) {
    console.error("Error generating hash:", error);
  }
};

generateHash();