/**
 * Custom Error Classes for Train Data Application
 * 
 * Provides typed error handling with error codes for client-side handling
 */

export enum ErrorCode {
  // Not Found Errors (404)
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  SCENARIO_NOT_FOUND = 'SCENARIO_NOT_FOUND',
  EDGE_CASE_NOT_FOUND = 'EDGE_CASE_NOT_FOUND',
  GENERATION_LOG_NOT_FOUND = 'GENERATION_LOG_NOT_FOUND',
  
  // Validation Errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  INVALID_QUALITY_SCORE = 'INVALID_QUALITY_SCORE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_TIER = 'INVALID_TIER',
  INVALID_TEMPLATE_VARIABLES = 'INVALID_TEMPLATE_VARIABLES',
  
  // Authorization Errors (403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Conflict Errors (409)
  DUPLICATE_CONVERSATION = 'DUPLICATE_CONVERSATION',
  DUPLICATE_TEMPLATE = 'DUPLICATE_TEMPLATE',
  
  // Database Errors (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  ERR_DB_QUERY = 'ERR_DB_QUERY',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // External Service Errors (502/503)
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business Logic Errors (422)
  INVALID_OPERATION = 'INVALID_OPERATION',
  BULK_OPERATION_FAILED = 'BULK_OPERATION_FAILED',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class ConversationNotFoundError extends AppError {
  constructor(conversationId: string) {
    super(
      ErrorCode.CONVERSATION_NOT_FOUND,
      `Conversation with ID ${conversationId} not found`,
      404,
      { conversationId }
    );
    this.name = 'ConversationNotFoundError';
  }
}

export class TemplateNotFoundError extends AppError {
  constructor(templateId: string) {
    super(
      ErrorCode.TEMPLATE_NOT_FOUND,
      `Template with ID ${templateId} not found`,
      404,
      { templateId }
    );
    this.name = 'TemplateNotFoundError';
  }
}

export class ScenarioNotFoundError extends AppError {
  constructor(scenarioId: string) {
    super(
      ErrorCode.SCENARIO_NOT_FOUND,
      `Scenario with ID ${scenarioId} not found`,
      404,
      { scenarioId }
    );
    this.name = 'ScenarioNotFoundError';
  }
}

export class EdgeCaseNotFoundError extends AppError {
  constructor(edgeCaseId: string) {
    super(
      ErrorCode.EDGE_CASE_NOT_FOUND,
      `Edge case with ID ${edgeCaseId} not found`,
      404,
      { edgeCaseId }
    );
    this.name = 'EdgeCaseNotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.INVALID_INPUT, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(ErrorCode.UNAUTHORIZED, message, 403);
    this.name = 'UnauthorizedError';
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string, 
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    options?: {
      cause?: Error;
      context?: any;
      statusCode?: number;
    }
  ) {
    const details = {
      ...options?.context,
      ...(options?.cause ? { cause: options.cause.message } : {})
    };
    super(
      code,
      message,
      options?.statusCode || 500,
      Object.keys(details).length > 0 ? details : undefined
    );
    this.name = 'DatabaseError';
  }
}

export class BulkOperationError extends AppError {
  constructor(
    message: string,
    public successfulIds: string[],
    public failedIds: string[],
    public errors: Array<{ id: string; error: string }>
  ) {
    super(ErrorCode.BULK_OPERATION_FAILED, message, 207, {
      successfulIds,
      failedIds,
      errors,
    });
    this.name = 'BulkOperationError';
  }
}

