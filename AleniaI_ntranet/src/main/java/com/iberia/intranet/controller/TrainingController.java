package com.iberia.intranet.controller;

import com.iberia.intranet.dto.EnrollmentDto;
import com.iberia.intranet.dto.TrainingDto;
import com.iberia.intranet.service.TrainingService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @GetMapping
    public Page<TrainingDto> list(@ParameterObject Pageable pageable) {
        return trainingService.listTrainings(pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingDto create(@RequestBody TrainingDto dto) {
        return trainingService.createTraining(dto);
    }

    @PostMapping("/{id}/enroll")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDto enroll(@PathVariable("id") UUID id, @RequestParam("userId") UUID userId) {
        return trainingService.enrollUser(id, userId);
    }

    @PostMapping("/enrollments/{id}/progress")
    public EnrollmentDto updateProgress(@PathVariable("id") UUID id,
            @RequestParam("progress") @Min(0) @Max(100) int progress) {
        return trainingService.updateProgress(id, progress);
    }

    @PostMapping("/enrollments/{id}/complete")
    public EnrollmentDto complete(@PathVariable("id") UUID id) {
        return trainingService.completeEnrollment(id);
    }
}
