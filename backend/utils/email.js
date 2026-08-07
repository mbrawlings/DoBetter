import { Resend } from 'resend';

let resendClient = null;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY must be set to send email');
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL must be set to send email');
  }
  return from;
}

export async function sendVerificationEmail({ to, code }) {
  const resend = getResend();
  const from = getFromAddress();

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: 'Your DoBetter verification code',
    text: `Your DoBetter verification code is ${code}. It expires in 15 minutes.`,
    html: `
      <p>Your DoBetter verification code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>It expires in 15 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send verification email');
  }

  return data;
}
