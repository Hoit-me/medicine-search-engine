import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailModule } from '@src/common/mail/mail.module';
import { MailService } from '@src/common/mail/mail.service';
import { configModule } from '@src/config';
import { catchError, from, map, of } from 'rxjs';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock_message_id', // Example of what might be resolved
    }),
  }),
}));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockReturnValue({
        setCredentials: jest.fn(),
        getAccessToken: jest.fn((callback) =>
          callback(null, { token: 'mock_access_token' }),
        ),
      }),
    },
  },
}));

describe('메일 서비스', () => {
  let mailService: MailService;
  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [MailModule, configModule],
      providers: [MailService, ConfigService],
    }).compile();
    mailService = testModule.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('send', () => {
    const mailDto = {
      to: 'test@test.test',
      subject: 'test',
      text: 'test',
      html: 'test',
    };
    it('Success', async () => {
      const result = await mailService.send(mailDto);
      expect(result).toBe(true);
    }); // Increase the timeout for this test

    it('Fail', async () => {
      jest.spyOn(mailService, 'send').mockRejectedValue(new Error('Fail'));
      await expect(mailService.send(mailDto)).rejects.toThrow('Fail');
    });
  });
});

describe('test', () => {
  from([12])
    .pipe(
      map((x) => x + 1),
      map((x) => {
        if (x === 2) throw { sad: 'asd' };
        return x;
      }),
      map((x) => x + 1),
      catchError((err) => {
        console.log(err);
        return of(err);
      }),
    )
    .subscribe((x) => console.log(x));
});
