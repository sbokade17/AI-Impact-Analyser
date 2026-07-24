package com.aiimpact.analyser.service;

import com.aiimpact.analyser.ai.AiProvider;
import com.aiimpact.analyser.ai.AnalysisResult;
import com.aiimpact.analyser.dto.ReportResponse;
import com.aiimpact.analyser.entity.*;
import com.aiimpact.analyser.exception.ResourceNotFoundException;
import com.aiimpact.analyser.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final AnalysisContextBuilderService analysisContextBuilderService;
    private final AiProvider aiProvider;

    private static final DateTimeFormatter DISPLAY_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'");

    // ─────────────────────────────────────────
    // Persist AI result as a Report entity
    // ─────────────────────────────────────────

    public void persistReport(AnalysisRun run, AnalysisResult result) {
        Report report = new Report();
        report.setAnalysisRun(run);
        report.setTicketId(run.getJiraTicketId());
        report.setTicketSummary(result.getTicketSummary());
        report.setGeneratedAt(LocalDateTime.now());
        report.setSummary(result.getSummary());

        mapAffectedFiles(report, result.getAffectedFiles());
        mapDbChanges(report, result.getDbChanges());
        mapFunctionalAreas(report, result.getFunctionalAreas());
        mapTestCases(report, result.getTestCases());
        mapRecommendations(report, result.getRecommendations());
        mapDependencies(report, result.getDependencies());

        ScoreComputation scores = computeScores(report);
        report.setScoreBdFiles(scores.files());
        report.setScoreBdDatabase(scores.database());
        report.setScoreBdFunctional(scores.functional());
        report.setScoreBdTests(scores.tests());
        report.setRiskScore(scores.total());
        report.setRiskLevel(scores.riskLevel());

        ensureProposedPatches(report);

        reportRepository.save(report);
    }

    // ─────────────────────────────────────────
    // Query
    // ─────────────────────────────────────────

    public ReportResponse getByRunId(UUID runId) {
        Report report = reportRepository.findByAnalysisRunId(runId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found for run: " + runId));

        ensureProposedPatches(report);
        return toResponse(report);
    }

    // ─────────────────────────────────────────
    // Mapping helpers
    // ─────────────────────────────────────────

    private void mapAffectedFiles(Report report, List<AnalysisResult.AffectedFileResult> items) {
        if (items == null) return;
        for (var item : items) {
            AffectedFile entity = new AffectedFile();
            entity.setReport(report);
            entity.setPath(item.getPath());
            entity.setFileType(item.getFileType());
            entity.setChangeType(item.getChangeType());
            entity.setRisk(item.getRisk());
            entity.setReason(item.getReason());
            entity.setLinesChanged(item.getLinesChanged());
            entity.setProposedPatch(item.getProposedPatch());
            report.getAffectedFiles().add(entity);
        }
    }

    private void mapDbChanges(Report report, List<AnalysisResult.DbChangeResult> items) {
        if (items == null) return;
        for (var item : items) {
            DbChange entity = new DbChange();
            entity.setReport(report);
            entity.setTableName(item.getTableName());
            entity.setOperation(item.getOperation());
            entity.setDetail(item.getDetail());
            entity.setRisk(item.getRisk());
            entity.setMigration(item.getMigration());
            report.getDbChanges().add(entity);
        }
    }

    private void mapFunctionalAreas(Report report, List<AnalysisResult.FunctionalAreaResult> items) {
        if (items == null) return;
        for (var item : items) {
            FunctionalArea entity = new FunctionalArea();
            entity.setReport(report);
            entity.setName(item.getName());
            entity.setImpact(item.getImpact());
            entity.setDescription(item.getDescription());
            if (item.getAffectedFlows() != null) {
                entity.getAffectedFlows().addAll(item.getAffectedFlows());
            }
            report.getFunctionalAreas().add(entity);
        }
    }

    private void mapTestCases(Report report, List<AnalysisResult.TestCaseResult> items) {
        if (items == null) return;
        for (var item : items) {
            TestCase entity = new TestCase();
            entity.setReport(report);
            entity.setTestId(item.getTestId());
            entity.setTitle(item.getTitle());
            entity.setType(item.getType());
            entity.setStatus(item.getStatus());
            entity.setFeature(item.getFeature());
            report.getTestCases().add(entity);
        }
    }

    private void mapRecommendations(Report report, List<AnalysisResult.RecommendationResult> items) {
        if (items == null) return;
        for (var item : items) {
            Recommendation entity = new Recommendation();
            entity.setReport(report);
            entity.setPriority(item.getPriority());
            entity.setText(item.getText());
            entity.setCategory(item.getCategory());
            report.getRecommendations().add(entity);
        }
    }

    private void mapDependencies(Report report, List<AnalysisResult.DependencyResult> items) {
        if (items == null) return;
        for (var item : items) {
            ReportDependency entity = new ReportDependency();
            entity.setReport(report);
            entity.setName(item.getName());
            entity.setVersion(item.getVersion());
            entity.setReason(item.getReason());
            report.getDependencies().add(entity);
        }
    }

    private void ensureProposedPatches(Report report) {
        boolean changed = false;

        for (AffectedFile file : report.getAffectedFiles()) {
            if (file.getProposedPatch() != null && !file.getProposedPatch().isBlank()) {
                continue;
            }

            var preview = analysisContextBuilderService.getAffectedFilePreview(report.getAnalysisRun().getProject(), file.getPath());
            if (preview.isEmpty() || preview.get().content() == null || preview.get().content().isBlank()) {
                continue;
            }

            try {
                String patch = aiProvider.generateProposedPatch(
                        file.getPath(),
                        file.getFileType(),
                        file.getChangeType(),
                        file.getReason(),
                        report.getAnalysisRun().getJiraContent(),
                        report.getAnalysisRun().getFeatureContent(),
                        preview.get().content());
                if (patch != null && !patch.isBlank()) {
                    file.setProposedPatch(patch.trim());
                    changed = true;
                }
            } catch (Exception ignored) {
                // Preserve the report even when patch generation is unavailable or rate-limited.
            }
        }

        if (changed) {
            reportRepository.save(report);
        }
    }

    private ScoreComputation computeScores(Report report) {
        int files = computeFilesScore(report.getAffectedFiles());
        int database = computeDatabaseScore(report.getDbChanges());
        int functional = computeFunctionalScore(report.getFunctionalAreas());
        int tests = computeTestScore(report.getTestCases());
        int total = files + database + functional + tests;
        String riskLevel = total >= 67 ? "High" : total >= 34 ? "Medium" : "Low";
        return new ScoreComputation(files, database, functional, tests, total, riskLevel);
    }

    private int computeFilesScore(List<AffectedFile> affectedFiles) {
        int breadth = Math.min(16, affectedFiles.size() * 3);
        int riskWeight = affectedFiles.stream().mapToInt(file -> switch (normalize(file.getRisk())) {
            case "high" -> 5;
            case "medium" -> 3;
            case "low" -> 1;
            default -> 2;
        }).sum();
        int sizeWeight = Math.min(8, affectedFiles.stream().mapToInt(file -> {
            if (file.getLinesChanged() >= 120) return 2;
            if (file.getLinesChanged() >= 40) return 1;
            return 0;
        }).sum());
        int changeWeight = Math.min(6, affectedFiles.stream().mapToInt(file -> switch (normalize(file.getChangeType())) {
            case "added", "deleted" -> 2;
            case "modified" -> 1;
            default -> 0;
        }).sum());
        return Math.min(40, breadth + riskWeight + sizeWeight + changeWeight);
    }

    private int computeDatabaseScore(List<DbChange> dbChanges) {
        int score = dbChanges.stream().mapToInt(change -> {
            int operationWeight = switch (normalize(change.getOperation())) {
                case "create" -> 8;
                case "alter" -> 6;
                case "drop column" -> 8;
                case "index" -> 3;
                default -> 4;
            };
            int riskWeight = switch (normalize(change.getRisk())) {
                case "high" -> 2;
                case "medium" -> 1;
                default -> 0;
            };
            return operationWeight + riskWeight;
        }).sum();
        return Math.min(30, score);
    }

    private int computeFunctionalScore(List<FunctionalArea> functionalAreas) {
        int impactWeight = functionalAreas.stream().mapToInt(area -> switch (normalize(area.getImpact())) {
            case "high" -> 7;
            case "medium" -> 5;
            case "low" -> 3;
            default -> 4;
        }).sum();
        int flowWeight = Math.min(4, functionalAreas.stream().mapToInt(area -> area.getAffectedFlows() == null ? 0 : area.getAffectedFlows().size()).sum() / 2);
        return Math.min(20, impactWeight + flowWeight);
    }

    private int computeTestScore(List<TestCase> testCases) {
        int statusWeight = testCases.stream().mapToInt(testCase -> switch (normalize(testCase.getStatus())) {
            case "required" -> 2;
            case "recommended" -> 1;
            default -> 0;
        }).sum();
        int integrationWeight = (int) testCases.stream()
                .filter(testCase -> "integration".equals(normalize(testCase.getType())))
                .count();
        int regressionWeight = (int) testCases.stream()
                .filter(testCase -> "regression".equals(normalize(testCase.getType())))
                .count();
        return Math.min(10, statusWeight + integrationWeight + Math.min(2, regressionWeight));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    // ─────────────────────────────────────────
    // DTO mapping
    // ─────────────────────────────────────────

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .analysisRunId(r.getAnalysisRun().getId())
                .ticketId(r.getTicketId())
                .ticketSummary(r.getTicketSummary())
                .riskLevel(r.getRiskLevel())
                .riskScore(r.getRiskScore())
                .scoreBreakdown(ReportResponse.ScoreBreakdownDto.builder()
                        .files(r.getScoreBdFiles())
                        .database(r.getScoreBdDatabase())
                        .functional(r.getScoreBdFunctional())
                        .tests(r.getScoreBdTests())
                        .build())
                .summary(r.getSummary())
                .generatedAt(r.getGeneratedAt().format(DISPLAY_FMT))
                .affectedFiles(r.getAffectedFiles().stream()
                    .map(f -> {
                        var preview = analysisContextBuilderService.getAffectedFilePreview(r.getAnalysisRun().getProject(), f.getPath());
                        return ReportResponse.AffectedFileDto.builder()
                            .path(f.getPath())
                            .type(f.getFileType())
                            .change(f.getChangeType())
                            .risk(f.getRisk())
                            .reason(f.getReason())
                            .linesChanged(f.getLinesChanged())
                                    .proposedPatch(f.getProposedPatch())
                            .previewContent(preview.map(AnalysisContextBuilderService.FilePreview::content).orElse(null))
                            .previewSource(preview.map(AnalysisContextBuilderService.FilePreview::source).orElse(null))
                            .previewBranch(preview.map(AnalysisContextBuilderService.FilePreview::branch).orElse(null))
                            .build();
                    })
                        .toList())
                .dbChanges(r.getDbChanges().stream()
                        .map(c -> ReportResponse.DbChangeDto.builder()
                                .table(c.getTableName())
                                .operation(c.getOperation())
                                .detail(c.getDetail())
                                .risk(c.getRisk())
                                .migration(c.getMigration())
                                .build())
                        .toList())
                .functionalAreas(r.getFunctionalAreas().stream()
                        .map(a -> ReportResponse.FunctionalAreaDto.builder()
                                .name(a.getName())
                                .impact(a.getImpact())
                                .description(a.getDescription())
                        .affectedFlows(a.getAffectedFlows() == null ? List.of() : List.copyOf(a.getAffectedFlows()))
                                .build())
                        .toList())
                .testCases(r.getTestCases().stream()
                        .map(t -> ReportResponse.TestCaseDto.builder()
                                .id(t.getTestId())
                                .title(t.getTitle())
                                .type(t.getType())
                                .status(t.getStatus())
                                .feature(t.getFeature())
                                .build())
                        .toList())
                .recommendations(r.getRecommendations().stream()
                        .map(rec -> ReportResponse.RecommendationDto.builder()
                                .priority(rec.getPriority())
                                .text(rec.getText())
                                .category(rec.getCategory())
                                .build())
                        .toList())
                .dependencies(r.getDependencies().stream()
                        .map(d -> ReportResponse.DependencyDto.builder()
                                .name(d.getName())
                                .version(d.getVersion())
                                .reason(d.getReason())
                                .build())
                        .toList())
                .build();
    }

    private record ScoreComputation(int files, int database, int functional, int tests, int total, String riskLevel) {
    }
}
