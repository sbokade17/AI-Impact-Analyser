package com.aiimpact.analyser.service;

import com.aiimpact.analyser.dto.SourceConnectionRequest;
import com.aiimpact.analyser.dto.SourceValidationResponse;
import com.aiimpact.analyser.entity.ConnectionStatus;
import com.aiimpact.analyser.entity.ConnectionType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.AntPathMatcher;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SourceValidationService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private static final Pattern GITHUB_PATH_PATTERN = Pattern.compile("^/?([^/]+)/([^/.]+)(?:\\.git)?/?$");

    public SourceValidationResponse validate(SourceConnectionRequest request) {
        if (request.getType() == null) {
            throw new IllegalArgumentException("Source type is required");
        }

        return switch (request.getType()) {
            case DATABASE_SCHEMA -> validateDatabase(request.getConfigJson());
            case GIT -> validateGit(request.getConfigJson());
            case FEATURE_FILES -> validateFeatureFiles(request.getConfigJson());
            case DOCS -> SourceValidationResponse.builder()
                    .type(ConnectionType.DOCS)
                    .status(ConnectionStatus.CONNECTED)
                    .message("Documentation source metadata accepted")
                    .metadataJson("{}")
                    .build();
        };
    }

    private SourceValidationResponse validateGit(String configJson) {
        Map<String, Object> payload = parseConfigJson(configJson);
        Object repoUrlRaw = payload.get("repoUrl");
        Object tokenRaw = payload.get("accessToken");
        String repoUrl = repoUrlRaw instanceof String ? ((String) repoUrlRaw).trim() : "";
        String accessToken = tokenRaw instanceof String ? ((String) tokenRaw).trim() : "";

        if (repoUrl.isBlank()) {
            throw new IllegalArgumentException("configJson.repoUrl is required for GIT validation");
        }

        boolean looksValid = repoUrl.startsWith("https://") || repoUrl.startsWith("http://") || repoUrl.startsWith("git@") || repoUrl.startsWith("github.com/");
        if (!looksValid) {
            throw new IllegalArgumentException("repoUrl must look like a valid git remote URL");
        }

        Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("repoUrl", repoUrl);

        Optional<GitHubRepoRef> repoRef = parseGitHubRepo(repoUrl);
        if (repoRef.isPresent()) {
            enrichGitHubMetadata(repoRef.get(), accessToken, metadata);
        }

        String metadataJson;
        try {
            metadataJson = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException ex) {
            metadataJson = "{}";
        }

        return SourceValidationResponse.builder()
                .type(ConnectionType.GIT)
                .status(ConnectionStatus.CONNECTED)
                .message("Repository URL format validated")
                .metadataJson(metadataJson)
                .build();
    }

    private Optional<GitHubRepoRef> parseGitHubRepo(String repoUrl) {
        String candidate = repoUrl.trim();
        try {
            if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
                URI uri = new URI(candidate);
                if (uri.getHost() == null || !uri.getHost().contains("github.com")) {
                    return Optional.empty();
                }
                Matcher matcher = GITHUB_PATH_PATTERN.matcher(uri.getPath());
                if (!matcher.matches()) {
                    return Optional.empty();
                }
                return Optional.of(new GitHubRepoRef(matcher.group(1), matcher.group(2)));
            }

            if (candidate.startsWith("git@github.com:")) {
                String path = candidate.substring("git@github.com:".length());
                Matcher matcher = GITHUB_PATH_PATTERN.matcher(path);
                if (!matcher.matches()) {
                    return Optional.empty();
                }
                return Optional.of(new GitHubRepoRef(matcher.group(1), matcher.group(2)));
            }

            if (candidate.startsWith("github.com/")) {
                String path = candidate.substring("github.com/".length());
                Matcher matcher = GITHUB_PATH_PATTERN.matcher(path);
                if (!matcher.matches()) {
                    return Optional.empty();
                }
                return Optional.of(new GitHubRepoRef(matcher.group(1), matcher.group(2)));
            }
        } catch (URISyntaxException ignored) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    private void enrichGitHubMetadata(GitHubRepoRef ref, String accessToken, Map<String, Object> metadata) {
        try {
            JsonNode repo = callGitHubJson("https://api.github.com/repos/" + ref.owner() + "/" + ref.repo(), accessToken);
            String defaultBranch = repo.path("default_branch").asText("main");
            metadata.put("defaultBranch", defaultBranch);

            String pushedAt = repo.path("pushed_at").asText(null);
            if (pushedAt != null) {
                metadata.put("lastSyncAt", formatGitHubTimestamp(pushedAt));
            }

            JsonNode tree = callGitHubJson("https://api.github.com/repos/" + ref.owner() + "/" + ref.repo() + "/git/trees/" + defaultBranch + "?recursive=1", accessToken);
            JsonNode treeEntries = tree.path("tree");
            if (treeEntries.isArray()) {
                int fileCount = 0;
                for (JsonNode entry : treeEntries) {
                    if ("blob".equals(entry.path("type").asText())) {
                        fileCount += 1;
                    }
                }
                metadata.put("indexedFiles", fileCount);
            }
        } catch (Exception ignored) {
            metadata.put("defaultBranch", metadata.getOrDefault("defaultBranch", "main"));
            metadata.put("lastSyncAt", metadata.getOrDefault("lastSyncAt", "Unknown"));
            metadata.put("indexedFiles", metadata.getOrDefault("indexedFiles", 0));
        }
    }

    private JsonNode callGitHubJson(String url, String accessToken) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/vnd.github+json")
                .GET();
        if (accessToken != null && !accessToken.isBlank()) {
            builder.header("Authorization", "Bearer " + accessToken);
        }

        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("GitHub API call failed: " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    private String formatGitHubTimestamp(String timestamp) {
        try {
            OffsetDateTime odt = OffsetDateTime.parse(timestamp);
            return odt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (Exception ignored) {
            return timestamp;
        }
    }

    private record GitHubRepoRef(String owner, String repo) {
    }

    private SourceValidationResponse validateFeatureFiles(String configJson) {
        Map<String, Object> payload = parseConfigJson(configJson);
        Object repoPathRaw = payload.get("repoPath");
        String repoPath = repoPathRaw instanceof String ? ((String) repoPathRaw).trim() : "";

        if (repoPath.isBlank()) {
            throw new IllegalArgumentException("configJson.repoPath is required for FEATURE_FILES validation");
        }

        int wildcardCount = repoPath.contains("*") ? 1 : 0;
        FeatureStats stats = scanFeatureFiles(repoPath);

        String metadataJson;
        try {
            metadataJson = objectMapper.writeValueAsString(Map.of(
                    "repoPath", repoPath,
                    "pathContainsWildcard", wildcardCount == 1,
                    "featureFileCount", stats.featureFileCount(),
                    "scenarioCount", stats.scenarioCount(),
                    "tagCount", stats.tagCount()
            ));
        } catch (JsonProcessingException ex) {
            metadataJson = "{}";
        }

        return SourceValidationResponse.builder()
                .type(ConnectionType.FEATURE_FILES)
                .status(ConnectionStatus.CONNECTED)
                .message("Feature path validated (" + stats.featureFileCount() + " files)")
                .metadataJson(metadataJson)
                .build();
    }

    private FeatureStats scanFeatureFiles(String repoPathPattern) {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        String normalizedPattern = repoPathPattern.replace('\\', '/');
        String deepPattern = "**/" + normalizedPattern;
        AntPathMatcher matcher = new AntPathMatcher();

        Set<Path> matchedFiles = new HashSet<>();

        Set<Path> candidateRoots = new HashSet<>();
        candidateRoots.add(cwd);
        if (cwd.getParent() != null) {
            candidateRoots.add(cwd.getParent());
            candidateRoots.add(cwd.getParent().resolve("samples/party-showcase"));
        }
        candidateRoots.add(cwd.resolve("samples/party-showcase"));

        for (Path root : candidateRoots) {
            Path normalizedRoot = root.toAbsolutePath().normalize();
            if (!Files.exists(normalizedRoot) || !Files.isDirectory(normalizedRoot)) {
                continue;
            }

            try (Stream<Path> paths = Files.walk(normalizedRoot)) {
                paths.filter(Files::isRegularFile)
                        .filter(path -> path.toString().endsWith(".feature"))
                        .forEach(path -> {
                            Path rel = normalizedRoot.relativize(path);
                            String relNormalized = rel.toString().replace('\\', '/');
                            if (matcher.match(normalizedPattern, relNormalized) || matcher.match(deepPattern, relNormalized)) {
                                matchedFiles.add(path.toAbsolutePath().normalize());
                            }
                        });
            } catch (IOException ignored) {
                // Try other candidate roots.
            }
        }

        int scenarioCount = 0;
        Set<String> uniqueTags = new HashSet<>();

        for (Path featureFile : matchedFiles) {
            try {
                List<String> lines = Files.readAllLines(featureFile);
                for (String line : lines) {
                    String trimmed = line.trim();
                    String lowered = trimmed.toLowerCase();
                    if (lowered.startsWith("scenario:") || lowered.startsWith("scenario outline:")) {
                        scenarioCount += 1;
                    }
                    if (trimmed.startsWith("@")) {
                        for (String token : trimmed.split("\\s+")) {
                            if (token.startsWith("@") && token.length() > 1) {
                                uniqueTags.add(token);
                            }
                        }
                    }
                }
            } catch (IOException ignored) {
                // Skip unreadable files and continue with others.
            }
        }

        return new FeatureStats(matchedFiles.size(), scenarioCount, uniqueTags.size());
    }

    private record FeatureStats(int featureFileCount, int scenarioCount, int tagCount) {
    }

    private SourceValidationResponse validateDatabase(String configJson) {
        String connectionString = extractConnectionString(configJson);
        if (connectionString == null || connectionString.isBlank()) {
            throw new IllegalArgumentException("configJson.connectionString is required for DATABASE_SCHEMA validation");
        }

        try (Connection connection = DriverManager.getConnection(connectionString)) {
            int tableCount = querySingleCount(connection,
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')");
            int foreignKeyCount = querySingleCount(connection,
                "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema NOT IN ('pg_catalog', 'information_schema')");
            int indexCount = querySingleCount(connection,
                "SELECT COUNT(*) FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema')");

            String metadataJson = objectMapper.writeValueAsString(Map.of(
                "tableCount", tableCount,
                "foreignKeyCount", foreignKeyCount,
                "indexCount", indexCount
            ));
            return SourceValidationResponse.builder()
                    .type(ConnectionType.DATABASE_SCHEMA)
                    .status(ConnectionStatus.CONNECTED)
                    .message("Database connection validated")
                    .metadataJson(metadataJson)
                    .build();

        } catch (Exception ex) {
            return SourceValidationResponse.builder()
                    .type(ConnectionType.DATABASE_SCHEMA)
                    .status(ConnectionStatus.ERROR)
                    .message(ex.getMessage())
                    .metadataJson("{}")
                    .build();
        }
    }

    private int querySingleCount(Connection connection, String sql) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        }
    }

    private String extractConnectionString(String configJson) {
        Map<String, Object> payload = parseConfigJson(configJson);
        Object value = payload.get("connectionString");
        return value instanceof String ? (String) value : null;
    }

    private Map<String, Object> parseConfigJson(String configJson) {
        if (configJson == null || configJson.isBlank()) {
            throw new IllegalArgumentException("configJson is required");
        }

        try {
            return objectMapper.readValue(configJson, new TypeReference<>() {});
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("configJson must be valid JSON", ex);
        }
    }
}
