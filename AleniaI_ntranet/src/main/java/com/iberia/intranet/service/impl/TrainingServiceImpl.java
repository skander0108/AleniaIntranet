package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.EnrollmentDto;
import com.iberia.intranet.dto.TrainingDto;
import com.iberia.intranet.entity.Enrollment;
import com.iberia.intranet.entity.Training;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.BadRequestException;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.EnrollmentMapper;
import com.iberia.intranet.mapper.TrainingMapper;
import com.iberia.intranet.repository.EnrollmentRepository;
import com.iberia.intranet.repository.TrainingRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingServiceImpl implements TrainingService {

    private final TrainingRepository trainingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<TrainingDto> listTrainings(Pageable pageable) {
        return trainingRepository.findAll(pageable).map(TrainingMapper::toDto);
    }

    @Override
    public TrainingDto createTraining(TrainingDto dto) {
        Training training = TrainingMapper.toEntity(dto);
        training.setId(null);
        return TrainingMapper.toDto(trainingRepository.save(training));
    }

    @Override
    public EnrollmentDto enrollUser(UUID trainingId, UUID userId) {
        Training training = getTraining(trainingId);
        User user = getUser(userId);

        if (enrollmentRepository.findByUserAndTraining(user, training).isPresent()) {
            throw new BadRequestException("User already enrolled in training");
        }

        Enrollment enrollment = Enrollment.builder()
                .status("IN_PROGRESS")
                .progressPercent(0)
                .training(training)
                .user(user)
                .build();
        return EnrollmentMapper.toDto(enrollmentRepository.save(enrollment));
    }

    @Override
    public EnrollmentDto updateProgress(UUID enrollmentId, int progressPercent) {
        if (progressPercent < 0 || progressPercent > 100) {
            throw new BadRequestException("Progress percent must be between 0 and 100");
        }
        Enrollment enrollment = getEnrollment(enrollmentId);
        enrollment.setProgressPercent(progressPercent);
        return EnrollmentMapper.toDto(enrollment);
    }

    @Override
    public EnrollmentDto completeEnrollment(UUID enrollmentId) {
        Enrollment enrollment = getEnrollment(enrollmentId);
        enrollment.setStatus("COMPLETED");
        enrollment.setProgressPercent(100);
        enrollment.setCompletedAt(OffsetDateTime.now());
        return EnrollmentMapper.toDto(enrollment);
    }

    private Training getTraining(UUID id) {
        return trainingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Training not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Enrollment getEnrollment(UUID id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enrollment not found: " + id));
    }
}

