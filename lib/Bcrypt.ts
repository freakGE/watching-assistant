import bcrypt from "bcrypt";

interface BcryptProps {
  type: "hash" | "compare";
  password: string;
}

const bcryptHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const bcryptCompare = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

const bcryptOperation = async (
  { type, password }: BcryptProps,
  hash?: string
): Promise<string | boolean> => {
  switch (type) {
    case "hash":
      return bcryptHash(password);
    case "compare":
      return bcryptCompare(password, hash!);
    default:
      throw new Error("Invalid bcrypt type");
  }
};

export default bcryptOperation;
