package com.aiimpact.analyser.ai;

import lombok.Data;

import java.util.List;

/**
 * Structured output from the AI provider.
 * Field names intentionally match the JSON schema we request from Gemini.
 */
@Data
public class AnalysisResult {

    private String ticketSummary;
    private String riskLevel;           // High | Medium | Low
    private int riskScore;              // 0–100
    private ScoreBreakdown scoreBreakdown;
    private String summary;

    private List<AffectedFileResult> affectedFiles;
    private List<DbChangeResult> dbChanges;
    private List<FunctionalAreaResult> functionalAreas;
    private List<TestCaseResult> testCases;
    private List<RecommendationResult> recommendations;
    private List<DependencyResult> dependencies;

    @Data
    public static class ScoreBreakdown {
        private int files;
        private int database;
        private int functional;
        private int tests;
    }

    @Data
    public static class AffectedFileResult {
        private String path;
        private String fileType;
        private String changeType;
        private String risk;
        private String reason;
        private int linesChanged;
        private String proposedPatch;
    }

    @Data
    public static class DbChangeResult {
        private String tableName;
        private String operation;
        private String detail;
        private String risk;
        private String migration;
    }

    @Data
    public static class FunctionalAreaResult {
        private String name;
        private String impact;
        private String description;
        private List<String> affectedFlows;
    }

    @Data
    public static class TestCaseResult {
        private String testId;
        private String title;
        private String type;
        private String status;
        private String feature;
    }

    @Data
    public static class RecommendationResult {
        private String priority;
        private String text;
        private String category;
    }

    @Data
    public static class DependencyResult {
        private String name;
        private String version;
        private String reason;
    }
}
