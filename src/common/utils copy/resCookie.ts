import { Response } from 'express';

export function resCookie(res: Response, option: string, token: string) {
  res.cookie(option, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
}
