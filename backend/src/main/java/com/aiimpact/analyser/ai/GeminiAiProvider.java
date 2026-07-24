package com.aiimpact.analyser.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calls the Google Gemini REST API directly using Spring's RestClient.
 * Activated when ai.provider=gemini (the default).
 */
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini", matchIfMissing = true)
@Slf4j
public class GeminiAiProvider implements AiProvider {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final List<String> fallbackModels;
    private final int maxRetries;
    private final long retryDelayMs;

    public GeminiAiProvider(
            @Value("${ai.gemini.api-key}") String apiKey,
            @Value("${ai.gemini.model}") String model,
            @Value("${ai.gemini.fallback-models:gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash}") String fallbackModelsCsv,
            @Value("${ai.gemini.base-url}") String baseUrl,
            @Value("${ai.gemini.max-retries:3}") int maxRetries,
            @Value("${ai.gemini.retry-delay-ms:800}") long retryDelayMs,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.fallbackModels = parseFallbackModels(fallbackModelsCsv);
        this.maxRetries = Math.max(1, maxRetries);
        this.retryDelayMs = Math.max(100, retryDelayMs);
        this.objectMapper = objectMapper;

        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(20))
                .build();

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }

    @Override
    public AnalysisResult analyze(AnalysisContext context) {
        String prompt = buildPrompt(context);
        String jsonResponse = callGemini(prompt);
        return parseResult(jsonResponse);
    }

    @Override
    public String generateFeatureFile(String jiraContent) {
        String prompt = buildFeaturePrompt(jiraContent);
        return callGeminiText(prompt);
    }

    @Override
    public String generateProposedPatch(
            String path,
            String fileType,
            String changeType,
            String reason,
            String jiraContent,
            String featureContent,
            String currentContent) {
        return callGeminiText(buildPatchPrompt(path, fileType, changeType, reason, jiraContent, featureContent, currentContent)).trim();
    }

    // ─────────────────────────────────────────────────────
    // Prompt construction
    // ─────────────────────────────────────────────────────

    private String buildPrompt(AnalysisContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
                You are an expert software impact analyser. Given a Jira requirement and a Gherkin \
                feature file, analyse the technical and business impact of implementing this change.

                Estimate which files will be affected, what DB schema changes are needed, which \
                functional areas and flows are impacted, what tests should be written or updated, \
                and provide prioritised recommendations.

            Ground the answer in the provided live repository, feature, schema, and docs context.
            Do not invent file paths, migration names, table names, or dependencies.
            If the context does not support a specific file path, omit it instead of guessing.
                For each affected file, provide a concise unified diff style proposed patch using the provided
                current file content when available. The patch should only include the hunk body needed for the
                suggested change and must start with --- and +++ lines for that file path. If you cannot ground
                a patch from the provided content, return an empty string for proposedPatch.

                JIRA TICKET:
                """);
        sb.append(ctx.getJiraContent()).append("\n\n");

        if (ctx.getFeatureContent() != null && !ctx.getFeatureContent().isBlank()) {
            sb.append("FEATURE FILE:\n").append(ctx.getFeatureContent()).append("\n\n");
        }
        if (ctx.getRetrievedCodeContext() != null && !ctx.getRetrievedCodeContext().isBlank()) {
            sb.append("RELEVANT CODE CONTEXT (from repository index):\n")
              .append(ctx.getRetrievedCodeContext()).append("\n\n");
        }

        sb.append("""
                Respond ONLY with a valid JSON object — no markdown, no explanation — matching \
                exactly this schema:
                {
                  "ticketSummary": "string",
                  "riskLevel": "High|Medium|Low",
                  "riskScore": 0-100,
                  "scoreBreakdown": { "files": 0-40, "database": 0-30, "functional": 0-20, "tests": 0-10 },
                  "summary": "string",
                  "affectedFiles": [
                    { "path": "string", "fileType": "service|controller|model|config|test|migration|feature",
                      "changeType": "modified|added|deleted", "risk": "High|Medium|Low",
                                            "reason": "string", "linesChanged": 0, "proposedPatch": "string" }
                  ],
                  "dbChanges": [
                    { "tableName": "string", "operation": "ALTER|CREATE|INDEX|DROP COLUMN",
                      "detail": "string", "risk": "High|Medium|Low", "migration": "string" }
                  ],
                  "functionalAreas": [
                    { "name": "string", "impact": "High|Medium|Low",
                      "description": "string", "affectedFlows": ["string"] }
                  ],
                  "testCases": [
                    { "testId": "TC-XXX", "title": "string",
                      "type": "regression|new|integration", "status": "recommended|required",
                      "feature": "string" }
                  ],
                  "recommendations": [
                    { "priority": "P0|P1|P2", "text": "string", "category": "string" }
                  ],
                  "dependencies": [
                    { "name": "string", "version": "string", "reason": "string" }
                  ]
                }
                """);
        return sb.toString();
    }

    // ─────────────────────────────────────────────────────
    // Gemini REST call
    // ─────────────────────────────────────────────────────

    private String callGemini(String prompt) {
        String raw = callGeminiRaw(prompt, Map.of(
            "responseMimeType", "application/json",
            "temperature", 0.2
        ));

        try {
            JsonNode root = objectMapper.readTree(raw);
            return root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    private String callGeminiText(String prompt) {
        String raw = callGeminiRaw(prompt, Map.of(
            "temperature", 0.2
        ));

        try {
            JsonNode root = objectMapper.readTree(raw);
            return root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    private String callGeminiRaw(String prompt, Map<String, Object> generationConfig) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", generationConfig
        );

        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(model);
        for (String fallback : fallbackModels) {
            if (!fallback.equals(model)) {
                modelsToTry.add(fallback);
            }
        }

        RestClientResponseException last404 = null;
        for (String currentModel : modelsToTry) {
            String url = "/models/" + currentModel + ":generateContent?key=" + apiKey;
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    log.info("Calling Gemini model={} attempt={}/{}", currentModel, attempt, maxRetries);
                    return restClient.post()
                            .uri(url)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(requestBody)
                            .retrieve()
                            .body(String.class);
                } catch (RestClientResponseException ex) {
                    int status = ex.getStatusCode().value();
                    if (status == 404) {
                        last404 = ex;
                        log.warn("Gemini model '{}' not found for generateContent; trying next fallback if available", currentModel);
                        break;
                    }

                    if (isRetryableStatus(status) && attempt < maxRetries) {
                        log.warn("Transient Gemini API error status={} model={} attempt={}/{}; retrying", status, currentModel, attempt, maxRetries);
                        sleepBackoff(attempt);
                        continue;
                    }
                    throw ex;
                } catch (ResourceAccessException ex) {
                    if (attempt < maxRetries) {
                        log.warn("Transient Gemini transport error model={} attempt={}/{}: {}", currentModel, attempt, maxRetries, ex.getMessage());
                        sleepBackoff(attempt);
                        continue;
                    }
                    throw ex;
                }
            }
        }

        String attempted = modelsToTry.stream().collect(Collectors.joining(", "));
        String detail = last404 == null ? "" : " Response: " + last404.getResponseBodyAsString();
        throw new RuntimeException("No supported Gemini model found. Attempted models: " + attempted + "." + detail);
    }

    private boolean isRetryableStatus(int status) {
        return status == 408 || status == 409 || status == 429 || status >= 500;
    }

    private void sleepBackoff(int attempt) {
        long delay = retryDelayMs * attempt;
        try {
            Thread.sleep(delay);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    private List<String> parseFallbackModels(String fallbackModelsCsv) {
        if (fallbackModelsCsv == null || fallbackModelsCsv.isBlank()) {
            return List.of();
        }
        return List.of(fallbackModelsCsv.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    // ─────────────────────────────────────────────────────
    // Parse JSON into AnalysisResult
    // ─────────────────────────────────────────────────────

    private AnalysisResult parseResult(String json) {
        try {
            return objectMapper.readValue(json, AnalysisResult.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialise AI response: {}", json, e);
            throw new RuntimeException("AI returned malformed JSON response", e);
        }
    }

    private String buildFeaturePrompt(String jiraContent) {
        return """
                You are an expert business analyst.
                Convert the following Jira requirement into a single well-formed Gherkin feature file.
                Requirements:
                - Return only the feature file text.
                - Include one Feature block.
                - Include 2 to 4 Scenarios.
                - Use realistic Given/When/Then steps.
                - Keep it aligned to the Jira requirement.

                JIRA REQUIREMENT:
                %s
                """.formatted(jiraContent);
    }

            private String buildPatchPrompt(
                String path,
                String fileType,
                String changeType,
                String reason,
                String jiraContent,
                String featureContent,
                String currentContent) {
            String featureSection = (featureContent == null || featureContent.isBlank())
                ? ""
                : "\nFEATURE FILE:\n" + featureContent + "\n";

            return """
                You are an expert software engineer producing a minimal grounded patch.

                Requirements:
                - Return only a unified diff style patch.
                - The patch must start with --- %1$s and +++ %1$s.
                - Keep the patch minimal and grounded in the current file content.
                - Do not invent classes, methods, imports, or symbols not supported by the current content and requirement.
                - If you cannot produce a grounded patch, return an empty string.

                FILE PATH:
                %1$s

                FILE TYPE:
                %2$s

                CHANGE TYPE:
                %3$s

                IMPACT REASON:
                %4$s

                JIRA TICKET:
                %5$s
                %6$s
                CURRENT FILE CONTENT:
                %7$s
                """.formatted(path, fileType, changeType, reason, jiraContent, featureSection, currentContent);
            }
}
