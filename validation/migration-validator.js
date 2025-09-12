const AuthValidator = require('./auth-validator');
const DiagramValidator = require('./diagram-validator');
const AdminValidator = require('./admin-validator');
const APIValidator = require('./api-validator');
const TaskVerifier = require('./task-verifier');
const TestReporter = require('./test-reporter');

class MigrationValidator {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.authValidator = new AuthValidator(baseUrl);
    this.diagramValidator = new DiagramValidator(baseUrl);
    this.adminValidator = new AdminValidator(baseUrl);
    this.apiValidator = new APIValidator(baseUrl);
    this.taskVerifier = new TaskVerifier();
    this.reporter = new TestReporter();
    this.results = {
      auth: [],
      diagrams: [],
      admin: [],
      api: [],
      overall: []
    };
  }

  async validateMigration() {
    console.log('🚀 Starting comprehensive migration validation...\n');
    
    try {
      // Run all validation tests
      await this.validateAuthentication();
      await this.validateDiagramOperations();
      await this.validateAdminFeatures();
      await this.validateAPIEndpoints();
      
      // Use task verifier to confirm requirements
      const verificationResult = await this.taskVerifier.verifyMigrationComplete(this.results);
      this.results.overall.push(verificationResult);
      
      // Generate final report
      const report = this.reporter.generateReport(this.results);
      console.log(report);
      
      return this.isMigrationSuccessful();
      
    } catch (error) {
      console.error('❌ Migration validation failed:', error.message);
      return false;
    }
  }

  async validateAuthentication() {
    console.log('🔐 Validating Authentication...');
    
    const tests = [
      () => this.authValidator.testLogin(),
      () => this.authValidator.testLogout(),
      () => this.authValidator.testSessionManagement(),
      () => this.authValidator.testPasswordReset(),
      () => this.authValidator.testUnauthorizedAccess()
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.results.auth.push(result);
      } catch (error) {
        this.results.auth.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  async validateDiagramOperations() {
    console.log('📊 Validating Diagram Operations...');
    
    const tests = [
      () => this.diagramValidator.testCreateDiagram(),
      () => this.diagramValidator.testReadDiagram(),
      () => this.diagramValidator.testUpdateDiagram(),
      () => this.diagramValidator.testDeleteDiagram(),
      () => this.diagramValidator.testDiagramRendering(),
      () => this.diagramValidator.testDiagramSharing()
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.results.diagrams.push(result);
      } catch (error) {
        this.results.diagrams.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  async validateAdminFeatures() {
    console.log('👑 Validating Admin Features...');
    
    const tests = [
      () => this.adminValidator.testUserManagement(),
      () => this.adminValidator.testSystemSettings(),
      () => this.adminValidator.testAuditLogs(),
      () => this.adminValidator.testPermissions()
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.results.admin.push(result);
      } catch (error) {
        this.results.admin.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  async validateAPIEndpoints() {
    console.log('🔌 Validating API Endpoints...');
    
    const tests = [
      () => this.apiValidator.testAuthEndpoints(),
      () => this.apiValidator.testDiagramEndpoints(),
      () => this.apiValidator.testUserEndpoints(),
      () => this.apiValidator.testAdminEndpoints(),
      () => this.apiValidator.testErrorHandling()
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.results.api.push(result);
      } catch (error) {
        this.results.api.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  isMigrationSuccessful() {
    const allResults = [
      ...this.results.auth,
      ...this.results.diagrams,
      ...this.results.admin,
      ...this.results.api
    ];
    
    const failedTests = allResults.filter(result => result.status === 'failed');
    return failedTests.length === 0;
  }
}

module.exports = MigrationValidator;