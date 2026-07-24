package com.aiimpact.analyser.controller;

import com.aiimpact.analyser.dto.GenerateFeatureFileRequest;
import com.aiimpact.analyser.dto.GenerateFeatureFileResponse;
import com.aiimpact.analyser.service.FeatureGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feature-files")
@RequiredArgsConstructor
public class FeatureFileController {

    private final FeatureGenerationService featureGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<GenerateFeatureFileResponse> generate(@Valid @RequestBody GenerateFeatureFileRequest request) {
        String featureContent = featureGenerationService.generateFeatureFile(request.getJiraContent());
        return ResponseEntity.ok(GenerateFeatureFileResponse.builder()
                .featureContent(featureContent)
                .build());
    }
}