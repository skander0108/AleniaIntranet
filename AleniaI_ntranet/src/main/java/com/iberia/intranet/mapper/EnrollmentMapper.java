package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.EnrollmentDto;
import com.iberia.intranet.entity.Enrollment;
import com.iberia.intranet.entity.Training;
import com.iberia.intranet.entity.User;

public final class EnrollmentMapper {

    private EnrollmentMapper() {
    }

    public static EnrollmentDto toDto(Enrollment enrollment) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .status(enrollment.getStatus())
                .progressPercent(enrollment.getProgressPercent())
                .startedAt(enrollment.getStartedAt())
                .completedAt(enrollment.getCompletedAt())
                .trainingId(enrollment.getTraining().getId())
                .userId(enrollment.getUser().getId())
                .build();
    }

    public static Enrollment toEntity(EnrollmentDto dto, Training training, User user) {
        return Enrollment.builder()
                .id(dto.getId())
                .status(dto.getStatus())
                .progressPercent(dto.getProgressPercent())
                .training(training)
                .user(user)
                .build();
    }
}

