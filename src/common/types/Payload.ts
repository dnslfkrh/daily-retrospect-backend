export interface UserPayload {
  id: number;
  email: string;
  name: string;
  google_id: string;
}

export interface JwtPayloadWithExp extends UserPayload {
  exp?: number;
  iat?: number;
  refreshToken?: string;
}