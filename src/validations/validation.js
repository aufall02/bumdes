import { CustomValidationError } from "../errors/customValidationError.js";

export const validate = (schema, request) => {
    const result = schema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    });

    if (result.error) {
        throw new CustomValidationError(result.error)
    } else {
        return result.value;
    }
};