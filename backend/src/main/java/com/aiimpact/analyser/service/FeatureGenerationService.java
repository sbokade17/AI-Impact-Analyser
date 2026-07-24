package com.aiimpact.analyser.service;

import com.aiimpact.analyser.ai.AiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeatureGenerationService {

    private final AiProvider aiProvider;

    public String generateFeatureFile(String jiraContent) {
        return aiProvider.generateFeatureFile(jiraContent);
    }
}