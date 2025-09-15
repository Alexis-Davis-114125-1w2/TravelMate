export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordMinLength = 6;

export const validateForm = (
  data: Record<string, string>,
  rules: Record<string, ValidationRule>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field] || '';
    const rule = rules[field];

    if (rule.required && !value.trim()) {
      errors[field] = 'Este campo es obligatorio';
      return;
    }

    if (!value.trim() && !rule.required) {
      return;
    }

    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Debe tener al menos ${rule.minLength} caracteres`;
      return;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `No puede tener más de ${rule.maxLength} caracteres`;
      return;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = 'Formato inválido';
      return;
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

export const loginValidationRules = {
  email: {
    required: true,
    pattern: emailPattern,
    custom: (value: string) => {
      if (!emailPattern.test(value)) {
        return 'Por favor ingresa un email válido';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: passwordMinLength,
    custom: (value: string) => {
      if (value.length < passwordMinLength) {
        return `La contraseña debe tener al menos ${passwordMinLength} caracteres`;
      }
      return null;
    }
  }
};
