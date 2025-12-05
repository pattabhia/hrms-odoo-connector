/**
 * Odoo Configuration
 * Settings for connecting to Odoo instance
 */

const activeProfile = process.env.ODOO_PROFILE || 'web';

const profiles = {
  // Default profile for existing remote/web Odoo instances
  web: {
    host: process.env.ODOO_WEB_HOST || process.env.ODOO_HOST || 'localhost',
    port: parseInt(process.env.ODOO_WEB_PORT || process.env.ODOO_PORT, 10) || 8069,
    database: process.env.ODOO_WEB_DATABASE || process.env.ODOO_DATABASE || 'odoo',
    username: process.env.ODOO_WEB_USERNAME || process.env.ODOO_USERNAME || 'admin',
    password: process.env.ODOO_WEB_PASSWORD || process.env.ODOO_PASSWORD || 'admin',
    protocol: process.env.ODOO_WEB_PROTOCOL || process.env.ODOO_PROTOCOL || 'http',
    secure: process.env.ODOO_WEB_SECURE === 'true' || process.env.ODOO_SECURE === 'true' || false
  },

  // Local Docker profile; pairs with docker-compose defaults
  docker: {
    host: process.env.ODOO_DOCKER_HOST || 'odoo',
    port: parseInt(process.env.ODOO_DOCKER_PORT, 10) || 8069,
    database: process.env.ODOO_DOCKER_DATABASE || process.env.ODOO_DATABASE || 'odoo',
    username: process.env.ODOO_DOCKER_USERNAME || process.env.ODOO_USERNAME || 'admin',
    password: process.env.ODOO_DOCKER_PASSWORD || process.env.ODOO_PASSWORD || 'admin',
    protocol: process.env.ODOO_DOCKER_PROTOCOL || 'http',
    secure: process.env.ODOO_DOCKER_SECURE === 'true' || false
  }
};

const resolvedProfile = profiles[activeProfile] ? activeProfile : 'web';
const selectedProfile = profiles[resolvedProfile];

const odooConfig = {
  // Odoo server connection details
  profile: resolvedProfile,
  host: selectedProfile.host,
  port: selectedProfile.port,
  database: selectedProfile.database,
  username: selectedProfile.username,
  password: selectedProfile.password,

  // Protocol settings
  protocol: selectedProfile.protocol,
  secure: selectedProfile.secure,

  // Connection pool settings
  pool: {
    min: parseInt(process.env.ODOO_POOL_MIN, 10) || 2,
    max: parseInt(process.env.ODOO_POOL_MAX, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.ODOO_POOL_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.ODOO_POOL_CONNECTION_TIMEOUT, 10) || 10000
  },

  // Retry settings for failed connections
  retry: {
    maxAttempts: parseInt(process.env.ODOO_RETRY_MAX_ATTEMPTS, 10) || 3,
    delayMs: parseInt(process.env.ODOO_RETRY_DELAY_MS, 10) || 1000,
    backoffMultiplier: parseFloat(process.env.ODOO_RETRY_BACKOFF_MULTIPLIER) || 2
  },

  // Timeout settings
  timeout: {
    connect: parseInt(process.env.ODOO_TIMEOUT_CONNECT, 10) || 10000,
    request: parseInt(process.env.ODOO_TIMEOUT_REQUEST, 10) || 30000
  },

  // Model names - can be customized if using custom Odoo modules
  models: {
    employee: process.env.ODOO_MODEL_EMPLOYEE || 'hr.employee',
    attendance: process.env.ODOO_MODEL_ATTENDANCE || 'hr.attendance',
    leave: process.env.ODOO_MODEL_LEAVE || 'hr.leave',
    department: process.env.ODOO_MODEL_DEPARTMENT || 'hr.department',
    job: process.env.ODOO_MODEL_JOB || 'hr.job',
    contract: process.env.ODOO_MODEL_CONTRACT || 'hr.contract',
    payslip: process.env.ODOO_MODEL_PAYSLIP || 'hr.payslip',
    expense: process.env.ODOO_MODEL_EXPENSE || 'hr.expense',
    invoice: process.env.ODOO_MODEL_INVOICE || 'account.move',
    applicant: process.env.ODOO_MODEL_APPLICANT || 'hr.applicant'
  },

  // Common fields for different models
  defaultFields: {
    employee: [
      'id',
      'name',
      'work_email',
      'work_phone',
      'mobile_phone',
      'job_id',
      'department_id',
      'parent_id',
      'work_location',
      'active',
      'create_date',
      'write_date'
    ],
    attendance: [
      'id',
      'employee_id',
      'check_in',
      'check_out',
      'worked_hours',
      'create_date'
    ],
    leave: [
      'id',
      'employee_id',
      'holiday_status_id',
      'date_from',
      'date_to',
      'number_of_days',
      'state',
      'create_date'
    ],
    payslip: [
      'id',
      'number',
      'employee_id',
      'date_from',
      'date_to',
      'state',
      'amount_total',
      'create_date'
    ],
    expense: [
      'id',
      'name',
      'employee_id',
      'total_amount',
      'state',
      'date',
      'payment_state',
      'create_date'
    ],
    invoice: [
      'id',
      'name',
      'partner_id',
      'invoice_date',
      'invoice_date_due',
      'amount_total',
      'payment_state',
      'state',
      'move_type'
    ],
    applicant: [
      'id',
      'name',
      'email_from',
      'partner_name',
      'job_id',
      'department_id',
      'stage_id',
      'create_date'
    ]
  }
};

/**
 * Get full Odoo URL
 */
odooConfig.getUrl = function() {
  return `${this.protocol}://${this.host}:${this.port}`;
};

/**
 * Get connection string (for logging, without password)
 */
odooConfig.getConnectionString = function() {
  return `${this.protocol}://${this.username}@${this.host}:${this.port}/${this.database}`;
};

module.exports = odooConfig;
