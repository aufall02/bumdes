import { CustomValidationError } from "../errors/customValidationError.js";

export const validate = (schema, request) => {
    const result = schema.validate(request, {
        // menampilkan seluruh error
        abortEarly: false,
        // abaikan field tambahan yang tidak perlu
        allowUnknown: false
    });

    if (result.error) {
        throw new CustomValidationError(result.error)
    } else {
        return result.value;
    }
};