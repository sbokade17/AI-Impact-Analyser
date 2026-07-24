package com.aiimpact.analyser.repository;

import com.aiimpact.analyser.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {

    @Query("SELECT r FROM Report r WHERE r.analysisRun.id = :runId")
    Optional<Report> findByAnalysisRunId(@Param("runId") UUID runId);
}
