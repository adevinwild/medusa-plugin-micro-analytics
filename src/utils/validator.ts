import { Constructor } from "@medusajs/types";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidationError, ValidatorOptions } from "class-validator";
import { MedusaError } from "medusa-core-utils";

const extendedValidators: Map<string, Constructor<any>> = new Map();

const reduceErrorMessages = (errs: ValidationError[]): string[] => {
  return errs.reduce((acc: string[], next) => {
    if (next.constraints) {
      for (const [_, msg] of Object.entries(next.constraints)) {
        acc.push(msg as string);
      }
    }

    if (next.children) {
      acc.push(...reduceErrorMessages(next.children));
    }
    return acc;
  }, []);
};

export async function validator<T, V>(
  typedClass: ClassConstructor<T>,
  plain: V,
  config: ValidatorOptions = {}
): Promise<T> {
  typedClass = extendedValidators.get(typedClass.name) ?? typedClass;

  const toValidate = plainToInstance(typedClass, plain);
  // @ts-ignore
  const errors = await validate(toValidate, {
    whitelist: true,
    forbidNonWhitelisted: true,
    ...config,
  });

  const errorMessages = reduceErrorMessages(errors);

  if (errors?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      errorMessages.join(", ")
    );
  }

  return toValidate;
}
