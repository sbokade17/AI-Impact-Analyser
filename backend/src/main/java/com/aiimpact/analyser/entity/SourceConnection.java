package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "source_connections")
@Getter
@Setter
public class SourceConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ConnectionType type;

    /**
     * JSON blob of connection settings (e.g., repoUrl, accessToken, connectionString).
     * In production these should be encrypted at rest.
     */
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ConnectionStatus status = ConnectionStatus.DISCONNECTED;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    /**
     * JSON blob of read-only stats: fileCount, tableCount, scenarioCount, etc.
     */
    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
