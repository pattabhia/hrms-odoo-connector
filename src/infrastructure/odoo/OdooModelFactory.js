/**
 * Odoo Model Factory
 * Implements Factory Pattern for creating model-specific handlers
 * Provides a centralized way to create repository instances for different Odoo models
 */
class OdooModelFactory {
  /**
   * Create a Model Factory
   * @param {OdooClient|OdooConnectionPool} odooClient - Odoo client or connection pool
   * @param {Object} config - Odoo configuration with model names
   * @param {Object} logger - Logger instance
   */
  constructor(odooClient, config, logger = console) {
    this.odooClient = odooClient;
    this.config = config;
    this.logger = logger;

    // Cache for created repositories
    this.repositoryCache = new Map();
  }

  /**
   * Create a repository for a specific model
   * @param {string} modelType - Type of model (employee, attendance, leave, etc.)
   * @param {Class} RepositoryClass - Repository class to instantiate
   * @returns {Object} Repository instance
   */
  createRepository(modelType, RepositoryClass) {
    // Check cache first
    const cacheKey = `${modelType}-${RepositoryClass.name}`;
    if (this.repositoryCache.has(cacheKey)) {
      this.logger.debug(`Returning cached repository for ${modelType}`);
      return this.repositoryCache.get(cacheKey);
    }

    // Get model name from config
    const modelName = this.getModelName(modelType);

    if (!modelName) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    // Create repository instance
    const repository = new RepositoryClass(
      this.odooClient,
      modelName,
      this.logger
    );

    // Cache the repository
    this.repositoryCache.set(cacheKey, repository);

    this.logger.info(`Created repository for ${modelType} (${modelName})`);

    return repository;
  }

  /**
   * Get Odoo model name for a given type
   * @param {string} modelType - Type of model
   * @returns {string|null} Odoo model name
   */
  getModelName(modelType) {
    const models = this.config.models || {};
    return models[modelType] || null;
  }

  /**
   * Get default fields for a model type
   * @param {string} modelType - Type of model
   * @returns {Array} Default fields
   */
  getDefaultFields(modelType) {
    const defaultFields = this.config.defaultFields || {};
    return defaultFields[modelType] || [];
  }

  /**
   * Clear repository cache
   * Useful for testing or when configuration changes
   */
  clearCache() {
    this.repositoryCache.clear();
    this.logger.info('Repository cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.repositoryCache.size,
      keys: Array.from(this.repositoryCache.keys())
    };
  }
}

module.exports = OdooModelFactory;
