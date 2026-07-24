package com.aiimpact.analyser.service;

import com.aiimpact.analyser.ai.AnalysisContext;
import com.aiimpact.analyser.entity.ConnectionType;
import com.aiimpact.analyser.entity.Project;
import com.aiimpact.analyser.entity.SourceConnection;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisContextBuilderService {

    private static final Pattern GITHUB_PATH_PATTERN = Pattern.compile("^/?([^/]+)/([^/.]+)(?:\\.git)?/?$");
    private static final Pattern TOKEN_PATTERN = Pattern.compile("[A-Za-z][A-Za-z0-9_-]{2,}");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "that", "this", "from", "into", "when", "then", "than", "what",
            "which", "should", "would", "could", "have", "has", "had", "user", "users", "system", "ticket",
            "summary", "acceptance", "criteria", "scenario", "feature", "given", "they", "them",
            "their", "party", "showcase", "create", "update", "data", "details", "valid", "successfully"
    );
    private static final Set<String> SOURCE_EXTENSIONS = Set.of(
            ".java", ".kt", ".groovy", ".xml", ".yml", ".yaml", ".sql", ".feature", ".md", ".txt", ".properties"
    );

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public AnalysisContext build(Project project, String jiraContent, String featureContent) {
        String retrievedCodeContext = buildRetrievedContext(project, jiraContent, featureContent);
        return AnalysisContext.builder()
                .jiraContent(jiraContent)
                .featureContent(featureContent)
                .retrievedCodeContext(retrievedCodeContext)
                .build();
    }

    public Optional<FilePreview> getAffectedFilePreview(Project project, String path) {
        String normalizedPath = path == null ? "" : path.trim().replace('\\', '/');
        if (normalizedPath.isBlank()) {
            return Optional.empty();
        }

        Optional<FilePreview> repoPreview = loadRepoPreview(project, normalizedPath);
        if (repoPreview.isPresent()) {
            return repoPreview;
        }

        return loadLocalPreview(normalizedPath);
    }

    private String buildRetrievedContext(Project project, String jiraContent, String featureContent) {
        StringBuilder sb = new StringBuilder();
        Set<String> keywords = extractKeywords(jiraContent, featureContent);

        appendRepoContext(sb, project, keywords);
        appendFeatureFileContext(sb, project, keywords);
        appendDatabaseContext(sb, project, keywords);
        appendDocsContext(sb, project);

        if (sb.length() == 0) {
            return null;
        }

        return sb.toString();
    }

    private void appendRepoContext(StringBuilder sb, Project project, Set<String> keywords) {
        findConnection(project, ConnectionType.GIT).ifPresent(source -> {
            Map<String, Object> config = parseJsonObject(source.getConfigJson());
            String repoUrl = asString(config.get("repoUrl"));
            String accessToken = asString(config.get("accessToken"));
            if (repoUrl.isBlank()) {
                return;
            }

            Optional<GitHubRepoRef> repoRef = parseGitHubRepo(repoUrl);
            if (repoRef.isEmpty()) {
                sb.append("REPOSITORY CONTEXT:\n")
                        .append("Repository URL: ").append(repoUrl).append("\n")
                        .append("No GitHub repository tree could be resolved from the configured URL.\n\n");
                return;
            }

            try {
                RepoSnapshot snapshot = loadRepositorySnapshot(repoRef.get(), accessToken, keywords);
                sb.append("REPOSITORY CONTEXT:\n")
                        .append("Repository: ").append(repoRef.get().owner()).append("/").append(repoRef.get().repo()).append("\n")
                        .append("Default branch: ").append(snapshot.defaultBranch()).append("\n")
                        .append("Candidate files from live repository tree:\n");

                for (ScoredPath candidate : snapshot.candidates()) {
                    sb.append("- ").append(candidate.path()).append("\n");
                }

                if (!snapshot.fileSnippets().isEmpty()) {
                    sb.append("\nLive repository snippets:\n");
                    for (FileSnippet snippet : snapshot.fileSnippets()) {
                        sb.append("FILE: ").append(snippet.path()).append("\n")
                                .append(snippet.content()).append("\n\n");
                    }
                }

                sb.append("Use only these repository paths when naming affected files unless another path is explicitly provided elsewhere in the context.\n\n");
            } catch (Exception ex) {
                log.warn("Failed to enrich repository context from {}", repoUrl, ex);
                sb.append("REPOSITORY CONTEXT:\n")
                        .append("Repository URL: ").append(repoUrl).append("\n")
                        .append("Repository tree lookup failed, so only the configured remote is known.\n\n");
            }
        });
    }

    private void appendFeatureFileContext(StringBuilder sb, Project project, Set<String> keywords) {
        findConnection(project, ConnectionType.FEATURE_FILES).ifPresent(source -> {
            Map<String, Object> config = parseJsonObject(source.getConfigJson());
            String repoPath = asString(config.get("repoPath"));
            if (repoPath.isBlank()) {
                return;
            }

            List<Path> files = locateFeatureFiles(repoPath);
            if (files.isEmpty()) {
                return;
            }

            sb.append("FEATURE FILE CONTEXT:\n")
                    .append("Configured feature path: ").append(repoPath).append("\n");

            for (Path file : files.stream().limit(5).toList()) {
                sb.append("- ").append(displayWorkspaceRelative(file)).append("\n");
            }

            sb.append("\nRelevant feature snippets:\n");
            for (Path file : rankFeatureFiles(files, keywords).stream().limit(3).toList()) {
                String content = readTextSafely(file, 2200);
                if (content.isBlank()) {
                    continue;
                }
                sb.append("FILE: ").append(displayWorkspaceRelative(file)).append("\n")
                        .append(content).append("\n\n");
            }
        });
    }

    private void appendDatabaseContext(StringBuilder sb, Project project, Set<String> keywords) {
        findConnection(project, ConnectionType.DATABASE_SCHEMA).ifPresent(source -> {
            Map<String, Object> config = parseJsonObject(source.getConfigJson());
            String connectionString = asString(config.get("connectionString"));
            if (connectionString.isBlank()) {
                return;
            }

            try (Connection connection = DriverManager.getConnection(connectionString)) {
                List<String> tableLines = new ArrayList<>();
                try (PreparedStatement stmt = connection.prepareStatement("""
                        SELECT table_name
                        FROM information_schema.tables
                        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
                        ORDER BY table_name
                        LIMIT 25
                        """)) {
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            tableLines.add(rs.getString(1));
                        }
                    }
                }

                if (!tableLines.isEmpty()) {
                    sb.append("DATABASE CONTEXT:\n")
                            .append("Live tables visible from the configured connection:\n");
                    for (String table : rankNames(tableLines, keywords).stream().limit(12).toList()) {
                        sb.append("- ").append(table).append("\n");
                    }
                    sb.append("\n");
                }
            } catch (Exception ex) {
                log.warn("Failed to inspect database schema for analysis context", ex);
            }
        });
    }

    private void appendDocsContext(StringBuilder sb, Project project) {
        findConnection(project, ConnectionType.DOCS).ifPresent(source -> {
            Map<String, Object> config = parseJsonObject(source.getConfigJson());
            Object rawFiles = config.get("files");
            if (!(rawFiles instanceof List<?> files) || files.isEmpty()) {
                return;
            }

            sb.append("DOCUMENTATION CONTEXT:\n");
            for (Object item : files.stream().limit(8).toList()) {
                if (item instanceof Map<?, ?> map) {
                    Object name = map.get("name");
                    if (name instanceof String value && !value.isBlank()) {
                        sb.append("- ").append(value).append("\n");
                    }
                }
            }
            sb.append("\n");
        });
    }

    private Optional<FilePreview> loadRepoPreview(Project project, String path) {
        Optional<SourceConnection> source = findConnection(project, ConnectionType.GIT);
        if (source.isEmpty()) {
            return Optional.empty();
        }

        Map<String, Object> config = parseJsonObject(source.get().getConfigJson());
        String repoUrl = asString(config.get("repoUrl"));
        String accessToken = asString(config.get("accessToken"));
        Optional<GitHubRepoRef> repoRef = parseGitHubRepo(repoUrl);
        if (repoRef.isEmpty()) {
            return Optional.empty();
        }

        try {
            JsonNode repo = callGitHubJson("https://api.github.com/repos/" + repoRef.get().owner() + "/" + repoRef.get().repo(), accessToken);
            String defaultBranch = repo.path("default_branch").asText("main");
            String content = fetchRepoFileContent(repoRef.get(), defaultBranch, path, accessToken);
            if (content.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new FilePreview(
                    truncateContent(content, 2600),
                    repoRef.get().owner() + "/" + repoRef.get().repo(),
                    defaultBranch
            ));
        } catch (Exception ex) {
            log.debug("Failed to load repository preview for {}", path, ex);
            return Optional.empty();
        }
    }

    private Optional<FilePreview> loadLocalPreview(String path) {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        List<Path> candidates = List.of(
                cwd.resolve(path).normalize(),
                cwd.resolve("samples/party-showcase").resolve(path).normalize(),
                cwd.resolve("backend").resolve(path).normalize()
        );

        for (Path candidate : candidates) {
            if (!Files.isRegularFile(candidate)) {
                continue;
            }

            String content = readTextSafely(candidate, 2600);
            if (content.isBlank()) {
                continue;
            }

            return Optional.of(new FilePreview(content, displayWorkspaceRelative(candidate), null));
        }

        return Optional.empty();
    }

    private RepoSnapshot loadRepositorySnapshot(GitHubRepoRef repoRef, String accessToken, Set<String> keywords) throws IOException, InterruptedException {
        JsonNode repo = callGitHubJson("https://api.github.com/repos/" + repoRef.owner() + "/" + repoRef.repo(), accessToken);
        String defaultBranch = repo.path("default_branch").asText("main");
        JsonNode tree = callGitHubJson("https://api.github.com/repos/" + repoRef.owner() + "/" + repoRef.repo() + "/git/trees/" + defaultBranch + "?recursive=1", accessToken);

        List<ScoredPath> candidates = new ArrayList<>();
        for (JsonNode entry : tree.path("tree")) {
            if (!"blob".equals(entry.path("type").asText())) {
                continue;
            }
            String path = entry.path("path").asText("");
            if (!isSupportedSourceFile(path)) {
                continue;
            }
            int score = scorePath(path, keywords);
            if (score <= 0) {
                continue;
            }
            candidates.add(new ScoredPath(path, score));
        }

        List<ScoredPath> ranked = candidates.stream()
                .sorted(Comparator.comparingInt(ScoredPath::score).reversed().thenComparing(ScoredPath::path))
                .limit(12)
                .toList();

        List<FileSnippet> snippets = new ArrayList<>();
        for (ScoredPath candidate : ranked.stream().limit(6).toList()) {
            String content = fetchRepoFileContent(repoRef, defaultBranch, candidate.path(), accessToken);
            if (content.isBlank()) {
                continue;
            }
            snippets.add(new FileSnippet(candidate.path(), truncateContent(content, 2200)));
        }

        return new RepoSnapshot(defaultBranch, ranked, snippets);
    }

    private String fetchRepoFileContent(GitHubRepoRef repoRef, String branch, String path, String accessToken) {
        try {
            JsonNode node = callGitHubJson("https://api.github.com/repos/" + repoRef.owner() + "/" + repoRef.repo() + "/contents/" + path + "?ref=" + branch, accessToken);
            String encoded = node.path("content").asText("").replace("\n", "");
            if (encoded.isBlank()) {
                return "";
            }
            byte[] bytes = Base64.getDecoder().decode(encoded);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            log.debug("Failed to fetch repository content for {}", path, ex);
            return "";
        }
    }

    private JsonNode callGitHubJson(String url, String accessToken) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .GET();
        if (!accessToken.isBlank()) {
            builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        }

        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("GitHub API call failed: " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    private List<Path> locateFeatureFiles(String repoPathPattern) {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        String normalizedPattern = repoPathPattern.replace('\\', '/');
        String deepPattern = "**/" + normalizedPattern;
        AntPathMatcher matcher = new AntPathMatcher();
        Set<Path> matchedFiles = new LinkedHashSet<>();

        Set<Path> candidateRoots = Set.of(
                cwd,
                cwd.resolve("samples/party-showcase").normalize(),
                Optional.ofNullable(cwd.getParent()).map(parent -> parent.resolve("samples/party-showcase").normalize()).orElse(cwd)
        );

        for (Path root : candidateRoots) {
            if (!Files.isDirectory(root)) {
                continue;
            }

            try (Stream<Path> paths = Files.walk(root)) {
                paths.filter(Files::isRegularFile)
                        .filter(path -> path.toString().endsWith(".feature"))
                        .forEach(path -> {
                            Path rel = root.relativize(path);
                            String relNormalized = rel.toString().replace('\\', '/');
                            if (matcher.match(normalizedPattern, relNormalized) || matcher.match(deepPattern, relNormalized)) {
                                matchedFiles.add(path.toAbsolutePath().normalize());
                            }
                        });
            } catch (IOException ex) {
                log.debug("Failed to walk feature root {}", root, ex);
            }
        }

        return List.copyOf(matchedFiles);
    }

    private List<Path> rankFeatureFiles(List<Path> files, Set<String> keywords) {
        return files.stream()
                .sorted(Comparator.<Path>comparingInt(path -> scorePath(displayWorkspaceRelative(path), keywords)).reversed()
                        .thenComparing(this::displayWorkspaceRelative))
                .toList();
    }

    private List<String> rankNames(List<String> names, Set<String> keywords) {
        return names.stream()
                .sorted(Comparator.<String>comparingInt(name -> scoreTokens(name, keywords)).reversed().thenComparing(String::compareTo))
                .toList();
    }

    private Set<String> extractKeywords(String jiraContent, String featureContent) {
        Set<String> keywords = new LinkedHashSet<>();
        collectKeywords(keywords, jiraContent);
        collectKeywords(keywords, featureContent);
        return keywords;
    }

    private void collectKeywords(Set<String> keywords, String text) {
        if (text == null || text.isBlank()) {
            return;
        }

        Matcher matcher = TOKEN_PATTERN.matcher(text.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            String token = matcher.group();
            if (token.length() < 3 || STOP_WORDS.contains(token)) {
                continue;
            }
            keywords.add(token);
            if (keywords.size() >= 40) {
                return;
            }
        }
    }

    private int scorePath(String path, Set<String> keywords) {
        int score = scoreTokens(path, keywords);
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.contains("controller")) score += 2;
        if (lower.contains("service")) score += 2;
        if (lower.contains("repository")) score += 1;
        if (lower.contains("migration") || lower.contains("db/")) score += 2;
        if (lower.endsWith(".feature")) score += 2;
        if (lower.endsWith(".md")) score += 1;
        return score;
    }

    private int scoreTokens(String value, Set<String> keywords) {
        String lower = value.toLowerCase(Locale.ROOT);
        int score = 0;
        for (String keyword : keywords) {
            if (lower.contains(keyword)) {
                score += keyword.length() > 6 ? 3 : 2;
            }
        }
        return score;
    }

    private boolean isSupportedSourceFile(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        for (String ext : SOURCE_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    private Optional<SourceConnection> findConnection(Project project, ConnectionType type) {
        return project.getSourceConnections().stream()
                .filter(connection -> connection.getType() == type)
                .findFirst();
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
        } catch (URISyntaxException ex) {
            log.debug("Failed to parse repo URL {}", repoUrl, ex);
        }
        return Optional.empty();
    }

    private Map<String, Object> parseJsonObject(String raw) {
        if (raw == null || raw.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<>() {
            });
        } catch (Exception ex) {
            log.debug("Failed to parse JSON object", ex);
            return new HashMap<>();
        }
    }

    private String asString(Object value) {
        return value instanceof String string ? string.trim() : "";
    }

    private String readTextSafely(Path file, int maxChars) {
        try {
            return truncateContent(Files.readString(file), maxChars);
        } catch (IOException ex) {
            log.debug("Failed to read file {}", file, ex);
            return "";
        }
    }

    private String truncateContent(String text, int maxChars) {
        String normalized = text.replace("\r\n", "\n");
        if (normalized.length() <= maxChars) {
            return normalized;
        }
        return normalized.substring(0, maxChars) + "\n...";
    }

    private String displayWorkspaceRelative(Path path) {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path absolute = path.toAbsolutePath().normalize();
        if (absolute.startsWith(cwd)) {
            return cwd.relativize(absolute).toString().replace('\\', '/');
        }
        return absolute.toString().replace('\\', '/');
    }

    private record GitHubRepoRef(String owner, String repo) {
    }

    public record FilePreview(String content, String source, String branch) {
    }

    private record ScoredPath(String path, int score) {
    }

    private record FileSnippet(String path, String content) {
    }

    private record RepoSnapshot(String defaultBranch, List<ScoredPath> candidates, List<FileSnippet> fileSnippets) {
    }
}