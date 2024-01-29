import Joi from 'joi';
export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(8000),
});

export default () => {
  const port = parseInt(process.env.PORT ?? '8000', 10);

  return { port };
};
