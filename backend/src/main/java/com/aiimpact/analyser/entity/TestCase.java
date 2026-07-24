package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "report_test_cases")
@Getter
@Setter
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "test_id", length = 50)
    private String testId;      // TC-501, TC-502, etc.

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(length = 50)
    private String type;        // regression | new | integration

    @Column(length = 50)
    private String status;      // recommended | required

    @Column(length = 255)
    private String feature;
}
