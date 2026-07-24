package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_run_id", nullable = false, unique = true)
    private AnalysisRun analysisRun;

    @Column(name = "ticket_id", length = 100)
    private String ticketId;

    @Column(name = "ticket_summary", columnDefinition = "TEXT")
    private String ticketSummary;

    @Column(name = "risk_level", nullable = false, length = 10)
    private String riskLevel;   // High | Medium | Low

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "score_bd_files", nullable = false)
    private int scoreBdFiles;

    @Column(name = "score_bd_database", nullable = false)
    private int scoreBdDatabase;

    @Column(name = "score_bd_functional", nullable = false)
    private int scoreBdFunctional;

    @Column(name = "score_bd_tests", nullable = false)
    private int scoreBdTests;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AffectedFile> affectedFiles = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbChange> dbChanges = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FunctionalArea> functionalAreas = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestCase> testCases = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recommendation> recommendations = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportDependency> dependencies = new ArrayList<>();
}
