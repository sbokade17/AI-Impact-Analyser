package com.aiimpact.analyser.repository;

import com.aiimpact.analyser.entity.AnalysisRun;
import com.aiimpact.analyser.entity.RunStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnalysisRunRepository extends JpaRepository<AnalysisRun, UUID> {

    List<AnalysisRun> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<AnalysisRun> findByStatus(RunStatus status);
}
