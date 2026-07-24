package com.aiimpact.analyser.service;

import com.aiimpact.analyser.ai.AnalysisContext;
import com.aiimpact.analyser.ai.AnalysisResult;
import com.aiimpact.analyser.ai.AiProvider;
import com.aiimpact.analyser.dto.AnalysisRunRequest;
import com.aiimpact.analyser.dto.AnalysisRunResponse;
import com.aiimpact.analyser.entity.*;
import com.aiimpact.analyser.exception.ResourceNotFoundException;
import com.aiimpact.analyser.repository.AnalysisRunRepository;
import com.aiimpact.analyser.repository.ProjectRepository;
import com.aiimpact.analyser.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final AnalysisRunRepository runRepository;
    private final ProjectRepository projectRepository;
    private final ReportRepository reportRepository;
    private final AiProvider aiProvider;
    private final ReportService reportService;
    private final AnalysisContextBuilderService analysisContextBuilderService;

    private static final Pattern TICKET_ID_PATTERN = Pattern.compile("Ticket:\\s*(\\S+)");

    // ─────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────

    @Transactional
    public AnalysisRunResponse createRun(AnalysisRunRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.getProjectId()));

        AnalysisRun run = new AnalysisRun();
        run.setProject(project);
        run.setJiraContent(request.getJiraContent());
        run.setFeatureContent(request.getFeatureContent());
        run.setJiraTicketId(extractTicketId(request.getJiraContent()));
        run.setStatus(RunStatus.QUEUED);
        AnalysisRun saved = runRepository.save(run);

        // Trigger async processing after transaction commits
        triggerAsync(saved.getId());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public AnalysisRunResponse getRun(UUID id) {
        return toResponse(findOrThrow(id));
    }

    // ─────────────────────────────────────────
    // Async processing
    // ─────────────────────────────────────────

    @Async
    public void triggerAsync(UUID runId) {
        processRun(runId);
    }

    /**
     * Core analysis pipeline executed in a background thread.
     * 1. Mark as INGESTING
     * 2. Build analysis context
     * 3. Mark as ANALYZING
     * 4. Call AI provider
     * 5. Persist report
     * 6. Mark as COMPLETED (or FAILED on error)
     */
    @Transactional
    public void processRun(UUID runId) {
        AnalysisRun run = findOrThrow(runId);
        log.info("Starting analysis run {}", runId);

        try {
            run.setStatus(RunStatus.INGESTING);
            run.setStartedAt(LocalDateTime.now());
            runRepository.save(run);

            // Build context (RAG retrieval can be added here in future)
                AnalysisContext context = analysisContextBuilderService.build(
                    run.getProject(),
                    run.getJiraContent(),
                    run.getFeatureContent()
                );

            run.setStatus(RunStatus.ANALYZING);
            runRepository.save(run);

            AnalysisResult result = aiProvider.analyze(context);

            reportService.persistReport(run, result);

            run.setStatus(RunStatus.COMPLETED);
            run.setCompletedAt(LocalDateTime.now());
            runRepository.save(run);
            log.info("Analysis run {} completed successfully", runId);

        } catch (Exception ex) {
            log.error("Analysis run {} failed", runId, ex);
            run.setStatus(RunStatus.FAILED);
            run.setErrorMessage(ex.getMessage());
            run.setCompletedAt(LocalDateTime.now());
            runRepository.save(run);
        }
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    private AnalysisRun findOrThrow(UUID id) {
        return runRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis run not found: " + id));
    }

    private String extractTicketId(String jiraContent) {
        if (jiraContent == null) return null;
        Matcher m = TICKET_ID_PATTERN.matcher(jiraContent);
        return m.find() ? m.group(1) : null;
    }

    private AnalysisRunResponse toResponse(AnalysisRun run) {
        return AnalysisRunResponse.builder()
                .id(run.getId())
                .projectId(run.getProject().getId())
                .status(run.getStatus())
                .jiraTicketId(run.getJiraTicketId())
                .errorMessage(run.getErrorMessage())
                .createdAt(run.getCreatedAt())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .build();
    }
}
