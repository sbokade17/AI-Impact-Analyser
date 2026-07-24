export type RiskLevel = 'High' | 'Medium' | 'Low'

export interface AffectedFile {
  path: string
  type: 'service' | 'controller' | 'model' | 'config' | 'test' | 'migration' | 'feature'
  change: 'modified' | 'added' | 'deleted'
  risk: RiskLevel
  reason: string
  linesChanged: number
  proposedPatch?: string
  previewContent?: string
  previewSource?: string
  previewBranch?: string
}

export interface DbChange {
  table: string
  operation: 'ALTER' | 'CREATE' | 'INDEX' | 'DROP COLUMN'
  detail: string
  risk: RiskLevel
  migration: string
}

export interface FunctionalArea {
  name: string
  impact: RiskLevel
  description: string
  affectedFlows: string[]
}

export interface TestCase {
  id: string
  title: string
  type: 'regression' | 'new' | 'integration'
  status: 'recommended' | 'required'
  feature: string
}

export interface Recommendation {
  priority: 'P0' | 'P1' | 'P2'
  text: string
  category: string
}

export interface ReportData {
  ticketId: string
  ticketSummary: string
  generatedAt: string
  riskLevel: RiskLevel
  riskScore: number
  scoreBreakdown: { files: number; database: number; functional: number; tests: number }
  summary: string
  affectedFiles: AffectedFile[]
  dbChanges: DbChange[]
  functionalAreas: FunctionalArea[]
  testCases: TestCase[]
  recommendations: Recommendation[]
  dependencies: { name: string; version: string; reason: string }[]
}

export const mockReport: ReportData = {
  ticketId: 'AI-101',
  ticketSummary: 'Analyze the Party Showcase registration flow',
  generatedAt: '2026-07-24 07:20 UTC',
  riskLevel: 'High',
  riskScore: 74,
  scoreBreakdown: { files: 30, database: 20, functional: 20, tests: 20 },
  summary:
    'The Party Showcase registration flow touches party creation, attendee validation, and persistence of related records. The report highlights the controller, service, and feature file updates needed to support duplicate attendee checks and stable registration behavior.',
  affectedFiles: [
    { path: 'src/main/java/com/blumek/partyshowcase/service/PartyService.java', type: 'service', change: 'modified', risk: 'High', reason: 'Core registration logic branches on duplicate attendees', linesChanged: 126 },
    { path: 'src/main/java/com/blumek/partyshowcase/controller/PartyController.java', type: 'controller', change: 'modified', risk: 'High', reason: 'Request validation accepts party and attendee payloads', linesChanged: 58 },
    { path: 'src/main/java/com/blumek/partyshowcase/model/Party.java', type: 'model', change: 'modified', risk: 'Medium', reason: 'New relationship and validation fields', linesChanged: 34 },
    { path: 'src/main/java/com/blumek/partyshowcase/model/Attendee.java', type: 'model', change: 'added', risk: 'Medium', reason: 'New entity for attendee lookups', linesChanged: 76 },
    { path: 'src/main/resources/db/migration/V2__create_party_registration.sql', type: 'migration', change: 'added', risk: 'High', reason: 'CREATE parties + party_attendees tables', linesChanged: 48 },
    { path: 'bootstrap/src/test/resources/stories/party-registration.feature', type: 'feature', change: 'modified', risk: 'Medium', reason: 'New Gherkin scenarios for Party Showcase registration', linesChanged: 64 },
    { path: 'src/test/java/com/blumek/partyshowcase/service/PartyServiceTest.java', type: 'test', change: 'modified', risk: 'Medium', reason: 'Duplicate attendee validation + registration assertions', linesChanged: 91 },
  ],
  dbChanges: [
    { table: 'parties', operation: 'CREATE', detail: 'CREATE TABLE parties (id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, owner_id UUID NOT NULL)', risk: 'High', migration: 'V2__create_party_registration.sql' },
    { table: 'party_attendees', operation: 'CREATE', detail: 'CREATE TABLE party_attendees (party_id UUID NOT NULL, attendee_name VARCHAR(255) NOT NULL)', risk: 'Medium', migration: 'V2__create_party_registration.sql' },
    { table: 'parties', operation: 'INDEX', detail: 'CREATE INDEX idx_parties_owner_id ON parties(owner_id)', risk: 'Low', migration: 'V2__create_party_registration.sql' },
  ],
  functionalAreas: [
    { name: 'Party Registration', impact: 'High', description: 'Party creation, attendee registration, and validation for duplicate attendees', affectedFlows: ['Party creation', 'Attendee registration', 'Duplicate attendee validation'] },
    { name: 'Notifications & Confirmation', impact: 'Medium', description: 'Success and error messaging should reflect the Party Showcase registration outcome', affectedFlows: ['Success banner', 'Validation errors', 'Audit trail'] },
  ],
  testCases: [
    { id: 'TC-101', title: 'Party registration saves attendees successfully', type: 'new', status: 'required', feature: 'party-registration.feature' },
    { id: 'TC-102', title: 'Duplicate attendee names are rejected', type: 'new', status: 'required', feature: 'party-registration.feature' },
    { id: 'TC-103', title: 'Existing parties still render correctly', type: 'regression', status: 'required', feature: 'party-history.feature' },
    { id: 'TC-104', title: 'Audit trail records attendee registration', type: 'integration', status: 'recommended', feature: 'party-registration.feature' },
  ],
  recommendations: [
    { priority: 'P0', text: 'Persist duplicate attendee validation before enabling the new registration flow.', category: 'Validation' },
    { priority: 'P1', text: 'Add end-to-end coverage for party creation and attendee registration.', category: 'Testing' },
    { priority: 'P1', text: 'Keep the Party Showcase confirmation and error messaging consistent across screens.', category: 'UX' },
    { priority: 'P2', text: 'Document the new party and attendee schema in the API changelog.', category: 'Documentation' },
  ],
  dependencies: [
    { name: 'spring-boot-starter-validation', version: '3.3.5', reason: 'Request validation for party registration inputs' },
    { name: 'postgresql', version: '42.7.x', reason: 'Party Showcase persistence layer' },
  ],
}
