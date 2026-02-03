export class AppError extends Error {
  constructor(message = 'Erreur applicative', status = 500, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(details) {
    super('La validation a échoué', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} introuvable`, 404);
  }
}
