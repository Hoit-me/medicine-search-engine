import Joi from 'joi';
export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
});
export default () => {
  const port = parseInt(process.env.PORT ?? '3000', 10);

  return { port };
};
