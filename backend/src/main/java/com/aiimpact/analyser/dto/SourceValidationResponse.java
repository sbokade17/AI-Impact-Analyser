package com.aiimpact.analyser.dto;

import com.aiimpact.analyser.entity.ConnectionStatus;
import com.aiimpact.analyser.entity.ConnectionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SourceValidationResponse {
    private ConnectionType type;
    private ConnectionStatus status;
    private String message;
    private String metadataJson;
}
