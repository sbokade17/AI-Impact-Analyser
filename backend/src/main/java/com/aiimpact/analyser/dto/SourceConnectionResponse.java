package com.aiimpact.analyser.dto;

import com.aiimpact.analyser.entity.ConnectionStatus;
import com.aiimpact.analyser.entity.ConnectionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SourceConnectionResponse {
    private UUID id;
    private ConnectionType type;
    private ConnectionStatus status;
    private LocalDateTime lastSyncedAt;
    private String configJson;
    private String metadataJson;
}
