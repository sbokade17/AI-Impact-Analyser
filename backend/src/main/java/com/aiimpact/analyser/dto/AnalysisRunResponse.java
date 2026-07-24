package com.aiimpact.analyser.dto;

import com.aiimpact.analyser.entity.RunStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AnalysisRunResponse {
    private UUID id;
    private UUID projectId;
    private RunStatus status;
    private String jiraTicketId;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
