import { IncomingWebhook } from '@slack/webhook';

export const sendErrorReportToSlack = async ({
  method,
  endpoint,
  ip,
  userAgent,
  referer,
  error,
}: {
  method: string;
  endpoint: string;
  ip: string;
  userAgent: string;
  referer: string;
  error: Error;
}) => {
  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL!);
  await webhook.send({
    attachments: [
      {
        color: '#FF4136', // 오류 메시지에 눈에 띄는 색상 적용
        pretext: '🚨 서버 에러가 발생했습니다 🚨', // 이모티콘으로 시각적 주의를 끌기
        author_name: 'Nestia 오류 보고서',
        title: '서버 에러 세부 정보', // 섹션 제목 강조
        text: '아래 세부 정보를 확인해주세요.\n',
        fields: [
          {
            title: '메소드',
            value: `\`\`\`${method}\`\`\``,
            short: true,
          },
          {
            title: '엔드포인트',
            value: `\`\`\`${endpoint}\`\`\``,
            short: true,
          },
          {
            title: 'IP 주소',
            value: `\`\`\`${ip}\`\`\``,
            short: true,
          },
          {
            title: '사용자 에이전트',
            value: `\`\`\`${userAgent}\`\`\``,
            short: true,
          },
          {
            title: '리퍼러',
            value: `\`\`\`${referer}\`\`\``,
            short: true,
          },
          {
            title: '발생시간',
            value: `\`\`\`${new Date().toLocaleString()}\`\`\``,
            short: true,
          },
          {
            title: '에러 메시지',
            value: error.message,
            short: false,
          },
          {
            title: '스택 트레이스',
            value: `\`\`\`${error.stack}\`\`\``,
            short: false,
          },
        ],
        footer: 'Nestia 오류 보고 시스템',
        ts: Math.floor(new Date().getTime() / 1000).toString(),
        mrkdwn_in: ['text', 'fields'], // Markdown을 허용하여 텍스트 스타일링 활성화
      },
    ],
  });
};
