package com.aiimpact.analyser.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerateFeatureFileResponse {
    private String featureContent;
}