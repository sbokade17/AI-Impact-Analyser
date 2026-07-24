package com.aiimpact.analyser.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mock AI provider for local development without a Gemini API key.
 * Activate with: ai.provider=mock  (or set AI_PROVIDER=mock env var)
 */
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock")
@Slf4j
public class MockAiProvider implements AiProvider {

    private static final Pattern TICKET_PATTERN = Pattern.compile("(?m)^Ticket:\\s*(.+)$");
    private static final Pattern SUMMARY_PATTERN = Pattern.compile("(?m)^Summary:\\s*(.+)$");
    private static final Pattern FEATURE_PATTERN = Pattern.compile("(?m)^Feature:\\s*(.+)$");

    @Override
    public AnalysisResult analyze(AnalysisContext context) {
        log.info("[MOCK] Returning generated analysis result from Jira + feature content");

        String jiraContent = context.getJiraContent() == null ? "" : context.getJiraContent();
        String featureContent = context.getFeatureContent() == null ? "" : context.getFeatureContent();
        String ticketSummary = extractSummaryOrFallback(jiraContent, featureContent);
        String featureTitle = extractOrDefault(FEATURE_PATTERN, featureContent, "Party registration");
        String ticketId = extractOrDefault(TICKET_PATTERN, jiraContent, "AI-101");
        int scenarioCount = countOccurrences(featureContent, "Scenario:") + countOccurrences(featureContent, "Scenario Outline:");
        boolean hasDuplicateValidation = featureContent.toLowerCase(Locale.ROOT).contains("duplicate");

        AnalysisResult result = new AnalysisResult();
        result.setTicketSummary(ticketSummary);
        result.setRiskLevel(scenarioCount >= 3 ? "High" : "Medium");
        result.setRiskScore(Math.min(90, 58 + scenarioCount * 8 + (hasDuplicateValidation ? 8 : 0)));

        result.setSummary("Ticket " + ticketId + ": the " + featureTitle + " change affects validation flows, data persistence, and regression coverage. "
            + "The generated report highlights the party registration workflow, duplicate attendee checks, and the database objects "
            + "that need to support storing party and attendee relationships.");

        AnalysisResult.AffectedFileResult f1 = new AnalysisResult.AffectedFileResult();
        f1.setPath("src/main/java/com/blumek/partyshowcase/service/PartyService.java");
        f1.setFileType("service");
        f1.setChangeType("modified");
        f1.setRisk("High");
        f1.setReason("Core party registration logic needs validation and persistence updates");
        f1.setLinesChanged(126);
        f1.setProposedPatch("""
            --- src/main/java/com/blumek/partyshowcase/service/PartyService.java
            +++ src/main/java/com/blumek/partyshowcase/service/PartyService.java
            @@
            -        attendeeRepository.saveAll(attendees);
            +        validateDuplicateAttendees(attendees);
            +        attendeeRepository.saveAll(attendees);
            """);

        AnalysisResult.AffectedFileResult f2 = new AnalysisResult.AffectedFileResult();
        f2.setPath("src/main/java/com/blumek/partyshowcase/controller/PartyController.java");
        f2.setFileType("controller");
        f2.setChangeType("modified");
        f2.setRisk("Medium");
        f2.setReason("Request validation now includes duplicate attendee detection");
        f2.setLinesChanged(58);
        f2.setProposedPatch("""
            --- src/main/java/com/blumek/partyshowcase/controller/PartyController.java
            +++ src/main/java/com/blumek/partyshowcase/controller/PartyController.java
            @@
            -    public ResponseEntity<?> createParty(@RequestBody PartyRequest request) {
            +    public ResponseEntity<?> createParty(@Valid @RequestBody PartyRequest request) {
            """);

        AnalysisResult.AffectedFileResult f3 = new AnalysisResult.AffectedFileResult();
        f3.setPath("src/test/resources/stories/party-registration.feature");
        f3.setFileType("feature");
        f3.setChangeType("added");
        f3.setRisk("Medium");
        f3.setReason("New scenarios describe the Party Showcase registration workflow");
        f3.setLinesChanged(Math.max(24, scenarioCount * 12));
        f3.setProposedPatch("""
            --- src/test/resources/stories/party-registration.feature
            +++ src/test/resources/stories/party-registration.feature
            @@
            +  Scenario: Prevent duplicate attendee names
            +    Given the organizer has already added attendee \"Mia\"
            +    When they try to add attendee \"Mia\" again
            +    Then the system shows a duplicate attendee validation message
            """);

        result.setAffectedFiles(List.of(f1, f2, f3));

        AnalysisResult.DbChangeResult db1 = new AnalysisResult.DbChangeResult();
        db1.setTableName("parties");
        db1.setOperation("CREATE");
        db1.setDetail("CREATE TABLE parties (id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, owner_id UUID NOT NULL)");
        db1.setRisk("High");
        db1.setMigration("V2__create_party_registration.sql");

        AnalysisResult.DbChangeResult db2 = new AnalysisResult.DbChangeResult();
        db2.setTableName("party_attendees");
        db2.setOperation("CREATE");
        db2.setDetail("CREATE TABLE party_attendees (party_id UUID NOT NULL, attendee_name VARCHAR(255) NOT NULL)");
        db2.setRisk("Medium");
        db2.setMigration("V2__create_party_registration.sql");

        result.setDbChanges(List.of(db1, db2));

        AnalysisResult.FunctionalAreaResult fa1 = new AnalysisResult.FunctionalAreaResult();
        fa1.setName("Party Registration");
        fa1.setImpact("High");
        fa1.setDescription("Create parties, register attendees, and persist the relationship data");
        fa1.setAffectedFlows(List.of("Party creation", "Attendee registration", "Duplicate attendee validation"));

        AnalysisResult.FunctionalAreaResult fa2 = new AnalysisResult.FunctionalAreaResult();
        fa2.setName("Notifications & Confirmation");
        fa2.setImpact("Medium");
        fa2.setDescription("Confirmation messages should reflect the saved party registration outcome");
        fa2.setAffectedFlows(List.of("Success banner", "Error validation", "Audit trail"));

        result.setFunctionalAreas(List.of(fa1, fa2));

        AnalysisResult.TestCaseResult tc1 = new AnalysisResult.TestCaseResult();
        tc1.setTestId("TC-101");
        tc1.setTitle("Party registration saves attendees successfully");
        tc1.setType("new");
        tc1.setStatus("required");
        tc1.setFeature("party-registration.feature");

        AnalysisResult.TestCaseResult tc2 = new AnalysisResult.TestCaseResult();
        tc2.setTestId("TC-102");
        tc2.setTitle("Duplicate attendee names are rejected");
        tc2.setType("new");
        tc2.setStatus("required");
        tc2.setFeature("party-registration.feature");

        result.setTestCases(List.of(tc1, tc2));

        AnalysisResult.RecommendationResult rec1 = new AnalysisResult.RecommendationResult();
        rec1.setPriority("P0");
        rec1.setText("Persist attendee validation rules before enabling the new registration flow.");
        rec1.setCategory("Validation");

        AnalysisResult.RecommendationResult rec2 = new AnalysisResult.RecommendationResult();
        rec2.setPriority("P1");
        rec2.setText("Add integration coverage for the Party Showcase registration journey.");
        rec2.setCategory("Testing");

        result.setRecommendations(List.of(rec1, rec2));

        AnalysisResult.DependencyResult dep1 = new AnalysisResult.DependencyResult();
        dep1.setName("spring-boot-starter-validation");
        dep1.setVersion("3.3.5");
        dep1.setReason("Required for attendee and party request validation");
        result.setDependencies(List.of(dep1));

        AnalysisResult.ScoreBreakdown breakdown = new AnalysisResult.ScoreBreakdown();
        breakdown.setFiles(result.getAffectedFiles().size() * 10);
        breakdown.setDatabase(result.getDbChanges().size() * 10);
        breakdown.setFunctional(result.getFunctionalAreas().size() * 10);
        breakdown.setTests(result.getTestCases().size() * 10);
        result.setScoreBreakdown(breakdown);

        return result;
    }

    private static String extractOrDefault(Pattern pattern, String input, String fallback) {
        Matcher matcher = pattern.matcher(input);
        return matcher.find() ? matcher.group(1).trim() : fallback;
    }

    private static String extractSummaryOrFallback(String jiraContent, String featureContent) {
        String summary = extractOrDefault(SUMMARY_PATTERN, jiraContent, "");
        if (!summary.isBlank()) {
            return summary;
        }

        String featureTitle = extractOrDefault(FEATURE_PATTERN, featureContent, "Party registration");
        return "Analyze the " + featureTitle.toLowerCase(Locale.ROOT) + " change for Party Showcase.";
    }

    private static int countOccurrences(String text, String token) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        int count = 0;
        int index = 0;
        while ((index = text.indexOf(token, index)) >= 0) {
            count += 1;
            index += token.length();
        }
        return count;
    }

        @Override
        public String generateFeatureFile(String jiraContent) {
                log.info("[MOCK] Returning generated feature file draft");

                String ticketSummary = extractSummaryOrFallback(jiraContent, "");
                return """
                                @ai-generated
                                Feature: Party registration
                                    As an organizer
                                    I want to create a party and register attendees
                                    So that the party details and relationships are stored correctly

                                    Scenario: Create a party with required details
                                        Given the organizer opens the party registration form
                                        When they enter a valid party name
                                        And they add at least one attendee
                                        Then the party is saved successfully

                                    Scenario: Prevent duplicate attendees
                                        Given the organizer has already added attendee "Mia"
                                        When they try to add attendee "Mia" again
                                        Then the system shows a duplicate attendee validation message

                                    # Drafted from: %s
                                """.formatted(ticketSummary).trim();
        }

                    @Override
                    public String generateProposedPatch(
                        String path,
                        String fileType,
                        String changeType,
                        String reason,
                        String jiraContent,
                        String featureContent,
                        String currentContent) {
                        log.info("[MOCK] Returning generated proposed patch for {}", path);

                        String body = switch (fileType == null ? "" : fileType) {
                            case "test" -> "@@\n+    @Test\n+    void shouldHandleUpdatedScenario() {\n+        // TODO align test assertions with the analysed requirement\n+    }\n";
                            case "feature" -> "@@\n+  Scenario: Cover analysed change\n+    Given the updated behavior is in place\n+    When the flow is executed\n+    Then the expected result is verified\n";
                            default -> "@@\n+    // TODO implement the analysed change described in the impact report\n";
                        };

                        return ("--- " + path + "\n"
                            + "+++ " + path + "\n"
                            + body).trim();
                    }
}
