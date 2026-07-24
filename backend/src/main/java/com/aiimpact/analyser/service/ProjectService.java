package com.aiimpact.analyser.service;

import com.aiimpact.analyser.dto.ProjectRequest;
import com.aiimpact.analyser.dto.ProjectResponse;
import com.aiimpact.analyser.dto.SourceConnectionRequest;
import com.aiimpact.analyser.dto.SourceConnectionResponse;
import com.aiimpact.analyser.entity.ConnectionStatus;
import com.aiimpact.analyser.entity.Project;
import com.aiimpact.analyser.entity.SourceConnection;
import com.aiimpact.analyser.exception.ResourceNotFoundException;
import com.aiimpact.analyser.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects() {
        return projectRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponse upsertSourceConnections(UUID projectId, List<SourceConnectionRequest> requests) {
        Project project = findOrThrow(projectId);

        // Replace all existing connections with the new set
        project.getSourceConnections().clear();

        for (SourceConnectionRequest req : requests) {
            SourceConnection sc = new SourceConnection();
            sc.setProject(project);
            sc.setType(req.getType());
            sc.setConfigJson(req.getConfigJson());
            sc.setMetadataJson(req.getMetadataJson());
            sc.setStatus(ConnectionStatus.CONNECTED);
            sc.setLastSyncedAt(LocalDateTime.now());
            project.getSourceConnections().add(sc);
        }

        return toResponse(projectRepository.save(project));
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    private Project findOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    private ProjectResponse toResponse(Project p) {
        List<SourceConnectionResponse> connections = p.getSourceConnections().stream()
                .map(sc -> SourceConnectionResponse.builder()
                        .id(sc.getId())
                        .type(sc.getType())
                        .status(sc.getStatus())
                        .lastSyncedAt(sc.getLastSyncedAt())
                    .configJson(sc.getConfigJson())
                        .metadataJson(sc.getMetadataJson())
                        .build())
                .toList();

        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .sourceConnections(connections)
                .build();
    }
}
