import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailSend } from '@src/type/mail.type';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async send({ to, subject, text, html }: MailSend) {
    const transporter = await this.getTransporter();
    await transporter
      .sendMail({
        from: this.configService.get('MAIL_USER'),
        to,
        subject,
        text,
        html,
      })
      .catch((e) => {
        // add error log
        console.error(e);
      });

    return true; // success
  }

  private async getTransporter() {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('OAUTH_CLIENT_ID'),
      this.configService.get('OAUTH_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );
    oauth2Client.setCredentials({
      refresh_token: this.configService.get('OAUTH_REFRESH_TOKEN'),
    });
    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token');
        }
        resolve(token!);
      });
    });
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('MAIL_USER'),
        clientId: this.configService.get('OAUTH_CLIENT_ID'),
        privateKey: this.configService.get('OAUTH_CLIENT_SECRET'),
        refreshToken: this.configService.get('OAUTH_REFRESH_TOKEN'),
        accessToken: accessToken as string,
      },
    });
  }
}
