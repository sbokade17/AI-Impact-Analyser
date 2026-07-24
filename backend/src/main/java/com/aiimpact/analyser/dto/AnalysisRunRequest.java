package com.aiimpact.analyser.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AnalysisRunRequest {

    @NotNull
    private UUID projectId;

    @NotBlank
    private String jiraContent;

    private String featureContent;
}
