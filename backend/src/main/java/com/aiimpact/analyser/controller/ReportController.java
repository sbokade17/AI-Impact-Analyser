package com.aiimpact.analyser.controller;

import com.aiimpact.analyser.dto.ReportResponse;
import com.aiimpact.analyser.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Fetch the full report for a completed analysis run.
     * The response shape mirrors the frontend's ReportData interface directly.
     */
    @GetMapping("/{runId}")
    public ResponseEntity<ReportResponse> getByRunId(@PathVariable UUID runId) {
        return ResponseEntity.ok(reportService.getByRunId(runId));
    }

    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<ReportResponse> getLatestByProjectId(@PathVariable UUID projectId) {
        return ResponseEntity.ok(reportService.getLatestByProjectId(projectId));
    }
}
