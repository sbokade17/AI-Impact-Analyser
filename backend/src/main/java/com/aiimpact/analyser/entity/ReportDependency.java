package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "report_dependencies")
@Getter
@Setter
public class ReportDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(length = 255)
    private String name;

    @Column(length = 100)
    private String version;

    @Column(columnDefinition = "TEXT")
    private String reason;
}
