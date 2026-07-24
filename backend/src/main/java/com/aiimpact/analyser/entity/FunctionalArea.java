package com.aiimpact.analyser.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "report_functional_areas")
@Getter
@Setter
public class FunctionalArea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(length = 255)
    private String name;

    @Column(length = 20)
    private String impact;  // High | Medium | Low

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(
        name = "report_functional_area_flows",
        joinColumns = @JoinColumn(name = "functional_area_id")
    )
    @Column(name = "flow", length = 500)
    private List<String> affectedFlows = new ArrayList<>();
}
