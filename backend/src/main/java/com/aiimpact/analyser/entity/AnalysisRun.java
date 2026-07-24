package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analysis_runs")
@Getter
@Setter
public class AnalysisRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RunStatus status = RunStatus.QUEUED;

    @Column(name = "jira_ticket_id", length = 100)
    private String jiraTicketId;

    @Column(name = "jira_content", columnDefinition = "TEXT")
    private String jiraContent;

    @Column(name = "feature_content", columnDefinition = "TEXT")
    private String featureContent;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @OneToOne(mappedBy = "analysisRun", cascade = CascadeType.ALL, orphanRemoval = true)
    private Report report;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
