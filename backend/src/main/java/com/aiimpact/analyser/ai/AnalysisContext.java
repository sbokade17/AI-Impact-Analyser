package com.aiimpact.analyser.ai;

import lombok.Builder;
import lombok.Data;

/**
 * Input to the AI analysis pipeline.
 * In future iterations this will also contain retrieved code/doc chunks (RAG).
 */
@Data
@Builder
public class AnalysisContext {

    /** Full Jira ticket text (ticket ID, summary, acceptance criteria). */
    private String jiraContent;

    /** Gherkin .feature file content. */
    private String featureContent;

    /**
     * Optional: retrieved code snippets from the indexed knowledge base (RAG).
     * Leave null for MVP; will be populated once embedding pipeline is wired up.
     */
    private String retrievedCodeContext;
}
