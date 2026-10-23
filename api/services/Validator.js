export class Validator
{
    static isNonEmptyString(value)
    {
        return typeof value === 'string' && value.trim().length > 0;
    }

    static isValidEmail(value)
    {
        return Validator.isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    static isValidPassword(value)
    {
        return Validator.isNonEmptyString(value) && value.length >= 8;
    }

    static isValidId(value)
    {
        return /^\d+$/.test(String(value));
    }
}
