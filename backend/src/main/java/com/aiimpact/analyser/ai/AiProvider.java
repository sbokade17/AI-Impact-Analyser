package com.aiimpact.analyser.ai;

/**
 * Pluggable AI provider interface.
 * Swap between mock, gemini, or live by changing the ai.provider property.
 */
public interface AiProvider {

    /**
     * Run impact analysis and return a structured result.
     *
     * @param context  the jira + feature content + optional retrieved code snippets
     * @return         the structured analysis result to be persisted as a Report
     */
    AnalysisResult analyze(AnalysisContext context);

    /**
     * Draft a Gherkin feature file from the Jira requirement.
     *
     * @param jiraContent the Jira requirement text
     * @return a feature file draft in plain text
     */
    String generateFeatureFile(String jiraContent);

    /**
     * Generate a grounded proposed patch for a single affected file.
     */
    String generateProposedPatch(
            String path,
            String fileType,
            String changeType,
            String reason,
            String jiraContent,
            String featureContent,
            String currentContent);
}
