import bcrypt from "bcryptjs";

const generateHash = async () => {
  const password = "Gummiworms11!!"; // change this
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed Password:", hash);
};

generateHash();