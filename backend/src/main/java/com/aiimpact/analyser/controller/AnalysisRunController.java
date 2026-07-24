package com.aiimpact.analyser.controller;

import com.aiimpact.analyser.dto.AnalysisRunRequest;
import com.aiimpact.analyser.dto.AnalysisRunResponse;
import com.aiimpact.analyser.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/analysis-runs")
@RequiredArgsConstructor
public class AnalysisRunController {

    private final AnalysisService analysisService;

    /**
     * Start a new analysis run.
     * The frontend Analysis Screen calls this when the user hits "Generate Report".
     * Returns immediately with status=QUEUED; frontend should poll GET /{id} for status.
     */
    @PostMapping
    public ResponseEntity<AnalysisRunResponse> create(@Valid @RequestBody AnalysisRunRequest request) {
        AnalysisRunResponse response = analysisService.createRun(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(response.getId()).toUri();
        return ResponseEntity.accepted().location(location).body(response);
    }

    /**
     * Poll the status of a run.
     * When status=COMPLETED the frontend can fetch the report via GET /api/reports/{id}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AnalysisRunResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(analysisService.getRun(id));
    }
}
