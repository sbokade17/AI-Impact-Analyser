package com.aiimpact.analyser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AiImpactAnalyserApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiImpactAnalyserApplication.class, args);
    }
}
