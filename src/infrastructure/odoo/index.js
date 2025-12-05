/**
 * Central export for Odoo infrastructure
 */

const OdooClient = require('./OdooClient');
const OdooConnectionPool = require('./OdooConnectionPool');
const OdooModelFactory = require('./OdooModelFactory');

module.exports = {
  OdooClient,
  OdooConnectionPool,
  OdooModelFactory
};
