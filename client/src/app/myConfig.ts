export class config {
  public static readonly PORT: number = 3000;
  public static readonly HOST: String = '192.168.2.139';
  public static readonly baseApiUrl: string = `http://${this.HOST}:${this.PORT}`;
}
