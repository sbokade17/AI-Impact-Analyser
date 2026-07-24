package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "report_db_changes")
@Getter
@Setter
public class DbChange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "table_name")
    private String tableName;

    @Column(length = 50)
    private String operation;  // ALTER | CREATE | INDEX | DROP COLUMN

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(length = 20)
    private String risk;

    @Column(length = 255)
    private String migration;
}
