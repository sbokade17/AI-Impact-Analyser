package com.aiimpact.analyser.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateFeatureFileRequest {

    @NotBlank
    private String jiraContent;
}