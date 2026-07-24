package com.aiimpact.analyser.controller;

import com.aiimpact.analyser.dto.ProjectRequest;
import com.aiimpact.analyser.dto.ProjectResponse;
import com.aiimpact.analyser.dto.SourceConnectionRequest;
import com.aiimpact.analyser.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(response.getId()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> list() {
        return ResponseEntity.ok(projectService.listProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    /**
     * Upserts the full set of source connections for a project.
     * The frontend Setup Screen calls this after configuring Git, Feature Files, DB, Docs.
     */
    @PutMapping("/{id}/sources")
    public ResponseEntity<ProjectResponse> updateSources(
            @PathVariable UUID id,
            @Valid @RequestBody List<SourceConnectionRequest> requests) {
        return ResponseEntity.ok(projectService.upsertSourceConnections(id, requests));
    }
}
