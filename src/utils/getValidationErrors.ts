import { ValidationError } from 'yup';

interface Error {
  [key: string]: string;
}

export default function getValidationErrors(err: ValidationError): Error {
  const validationError: Error = {};

  err.inner.forEach(error => {
    validationError[error.path] = error.message;
  });

  return validationError;
}
