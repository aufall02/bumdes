import pkg from "joi";
const { ValidationError } = pkg;

export class CustomValidationError extends ValidationError {
    constructor(error) {
        super({error});

        this.message = error.message.replace(/["\\]/g, '').replace(/\.\s+/g, '.').split('.');
        this.details = error.details;
        this.original = error.original
    }
}