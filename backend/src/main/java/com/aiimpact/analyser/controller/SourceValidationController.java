package com.aiimpact.analyser.controller;

import com.aiimpact.analyser.dto.SourceConnectionRequest;
import com.aiimpact.analyser.dto.SourceValidationResponse;
import com.aiimpact.analyser.service.SourceValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/sources")
@RequiredArgsConstructor
public class SourceValidationController {

    private final SourceValidationService sourceValidationService;

    @PostMapping("/validate")
    public ResponseEntity<SourceValidationResponse> validate(@Valid @RequestBody SourceConnectionRequest request) {
        return ResponseEntity.ok(sourceValidationService.validate(request));
    }
}
