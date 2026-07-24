package com.aiimpact.analyser.dto;

import com.aiimpact.analyser.entity.ConnectionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SourceConnectionRequest {

    @NotNull
    private ConnectionType type;

    /**
     * JSON-serialised connection settings.
     * For GIT: {"repoUrl": "...", "accessToken": "..."}
     * For FEATURE_FILES: {"repoPath": "..."}
     * For DATABASE_SCHEMA: {"connectionString": "..."}
     * For DOCS: (send files via multipart; this field can hold metadata)
     */
    private String configJson;

    /**
     * JSON metadata computed during validation (e.g., branch, indexed file count).
     */
    private String metadataJson;
}
