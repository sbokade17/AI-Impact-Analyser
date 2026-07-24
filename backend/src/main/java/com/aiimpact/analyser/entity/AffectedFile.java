package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "report_affected_files")
@Getter
@Setter
public class AffectedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String path;

    @Column(name = "file_type", length = 50)
    private String fileType;   // service | controller | model | config | test | migration | feature

    @Column(name = "change_type", length = 50)
    private String changeType; // modified | added | deleted

    @Column(length = 20)
    private String risk;       // High | Medium | Low

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "lines_changed")
    private int linesChanged;

    @Column(name = "proposed_patch", columnDefinition = "TEXT")
    private String proposedPatch;
}
