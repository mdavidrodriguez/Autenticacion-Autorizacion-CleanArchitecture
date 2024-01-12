import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
  constructor(
    // DI
    private readonly emialService: EmailService
  ) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);
      //   Encriptar la constraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);
      const token = await JwtAdapter.generateToken({
        id: user.id,
        email: user.email,
      });
      return { user: userEntity, token: token };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    // Find one para verificar si existe
    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest("Email is not valid");
    const isMatching = bcryptAdapter.compare(
      loginUserDto.password,
      user.password
    );
    if (!isMatching) throw CustomError.badRequest("password is not valid");
    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({
      id: user.id,
      email: user.email,
    });
    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return {
      user: userEntity,
      token: token,
    };
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({
      email,
    });
    if (!token) throw CustomError.internalServer("Error getting token");
    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
    const html = `
    <h1>Validate your email </h1>
    <p>Click on the following linl to validate your email</p>
    <a href="${link}">Validate your email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: "validate your email",
      htmlBody: html,
    };
    const isSet = await this.emialService.sendEmail(options);
    if (!isSet) throw CustomError.internalServer("Error sending email");
    return true;
  };

  public validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.badRequest("Invalid token");
    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not in token");
    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServer("Email not exist");
    user.emailValidated = true;
    await user.save();
    return true;
  };
}
