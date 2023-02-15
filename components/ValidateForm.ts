export const ValidateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const ValidateLength = (
  str: string,
  type: "Username" | "Password",
  min: number,
  max?: number
) => {
  if (str.length === 0)
    return {
      status: "failed",
      message:
        type === "Username" ? "Username is required" : "Enter a password",
    };
  if (str.length < min)
    return {
      status: "failed",
      message: `Must be ${min} or more characters long`,
    };
  if (max && str.length > max)
    return {
      status: "failed",
      message: `Must be ${max} or fewer characters long`,
    };

  return {
    status: "success",
    value: str,
  };
};

export const ValidatePassword = (password: string) => {
  return ValidateLength(password, "Password", 8);
};

export const ValidateUsername = (username: string) => {
  return ValidateLength(username, "Username", 5, 15);
};
