package com.aiimpact.analyser.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ReportResponse {

    private UUID id;
    private UUID analysisRunId;
    private String ticketId;
    private String ticketSummary;
    private String riskLevel;
    private int riskScore;
    private ScoreBreakdownDto scoreBreakdown;
    private String summary;
    private String generatedAt;

    private List<AffectedFileDto> affectedFiles;
    private List<DbChangeDto> dbChanges;
    private List<FunctionalAreaDto> functionalAreas;
    private List<TestCaseDto> testCases;
    private List<RecommendationDto> recommendations;
    private List<DependencyDto> dependencies;

    @Data
    @Builder
    public static class ScoreBreakdownDto {
        private int files;
        private int database;
        private int functional;
        private int tests;
    }

    @Data
    @Builder
    public static class AffectedFileDto {
        private String path;
        private String type;
        private String change;
        private String risk;
        private String reason;
        private int linesChanged;
        private String proposedPatch;
        private String previewContent;
        private String previewSource;
        private String previewBranch;
    }

    @Data
    @Builder
    public static class DbChangeDto {
        private String table;
        private String operation;
        private String detail;
        private String risk;
        private String migration;
    }

    @Data
    @Builder
    public static class FunctionalAreaDto {
        private String name;
        private String impact;
        private String description;
        private List<String> affectedFlows;
    }

    @Data
    @Builder
    public static class TestCaseDto {
        private String id;
        private String title;
        private String type;
        private String status;
        private String feature;
    }

    @Data
    @Builder
    public static class RecommendationDto {
        private String priority;
        private String text;
        private String category;
    }

    @Data
    @Builder
    public static class DependencyDto {
        private String name;
        private String version;
        private String reason;
    }
}
