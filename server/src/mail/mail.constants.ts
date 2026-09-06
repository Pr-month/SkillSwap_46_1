const styles = {
  container: `
    max-width: 600px;
    margin: 0 auto;
    padding: 32px 24px;
    font-family: 'Arial', sans-serif;
    color: #333;
  `,
  title: `
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #333;
  `,
  text: `
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: #555;
  `,
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #508826;
    color: #ffffff;
    text-decoration: none;
    border-radius: 12px;
    font-size: 16px;
    margin: 24px 0;
  `,
  footer: `
    font-size: 14px;
    color: #999;
    margin-top: 32px;
  `,
};

const confirmationTemplate = (link: string) => `
  <div style="${styles.container}">
    <h1 style="${styles.title}">SkillSwap 46-1</h1>
    <h2 style="${styles.title}">Подтвердите вашу почту</h2>
    <p style="${styles.text}">Здравствуйте!</p>
    <p style="${styles.text}">Благодарим за регистрацию. Чтобы активировать аккаунт, подтвердите ваш email.</p>
    <a href="${link}" style="${styles.button}">Подтвердить почту</a>
    <p style="${styles.text}">Или перейдите по ссылке:</p>
    <p style="${styles.text}"><a href="${link}" style="color: #508826;">${link}</a></p>
    <p style="${styles.footer}">Ссылка действительна в течение 24 часов.</p>
    <p style="${styles.footer}">Если вы не регистрировались, просто проигнорируйте это письмо.</p>
  </div>
`;

const resetPasswordTemplate = (link: string) => `
  <div style="${styles.container}">
    <h1 style="${styles.title}">SkillSwap 46-1</h1>
    <h2 style="${styles.title}">Сброс пароля</h2>
    <p style="${styles.text}">Здравствуйте!</p>
    <p style="${styles.text}">Мы получили запрос на сброс пароля. Чтобы продолжить, нажмите на кнопку ниже.</p>
    <a href="${link}" style="${styles.button}">Сбросить пароль</a>
    <p style="${styles.text}">Или перейдите по ссылке:</p>
    <p style="${styles.text}"><a href="${link}" style="color: #508826;">${link}</a></p>
    <p style="${styles.text}">Ссылка действительна в течение 24 часов.</p>
    <p style="${styles.footer}">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
  </div>
`;

export const MAIL_TEMPLATES = {
  confirmation: {
    subject: 'Подтверждение регистрации',
    getHtml: confirmationTemplate,
  },
  resetPassword: {
    subject: 'Сброс пароля',
    getHtml: resetPasswordTemplate,
  },
} as const;
