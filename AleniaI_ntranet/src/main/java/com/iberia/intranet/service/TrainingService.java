package com.iberia.intranet.service;

import com.iberia.intranet.dto.EnrollmentDto;
import com.iberia.intranet.dto.TrainingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TrainingService {

    Page<TrainingDto> listTrainings(Pageable pageable);

    TrainingDto createTraining(TrainingDto dto);

    EnrollmentDto enrollUser(UUID trainingId, UUID userId);

    EnrollmentDto updateProgress(UUID enrollmentId, int progressPercent);

    EnrollmentDto completeEnrollment(UUID enrollmentId);
}

