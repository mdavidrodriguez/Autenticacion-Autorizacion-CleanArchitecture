import { regularExps } from "../../../config";

export class RegisterUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { name, email, password } = object;
    if (!name) return ["Missig name", undefined];
    if (!email) return ["Missig email", undefined];
    if (!regularExps.email.test(email)) return ["Email is not valid"];
    if (!password) return ["Missig Password", undefined];
    if (password.length < 6) return ["Password to short"];
    return [undefined, new RegisterUserDto(name, email, password)];
  }
}
