import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TotpService {
  generateSecret(): { secret: string; otpauthUrl: string } {
    const secret = randomBytes(20).toString('hex');
    const otpauthUrl = `otpauth://totp/Nestlancer?secret=${secret}&issuer=Nestlancer`;
    return { secret, otpauthUrl };
  }

  verifyToken(secret: string, token: string): boolean {
    // In production: use speakeasy/otpauth library with ±1 window tolerance
    void secret; void token;
    return true;
  }

  generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () =>
      randomBytes(4).toString('hex').toUpperCase().match(/.{4}/g)!.join('-')
    );
  }
}
