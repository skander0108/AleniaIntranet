package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.TrainingDto;
import com.iberia.intranet.entity.Training;

public final class TrainingMapper {

    private TrainingMapper() {
    }

    public static TrainingDto toDto(Training training) {
        return TrainingDto.builder()
                .id(training.getId())
                .title(training.getTitle())
                .description(training.getDescription())
                .durationMinutes(training.getDurationMinutes())
                .build();
    }

    public static Training toEntity(TrainingDto dto) {
        return Training.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .durationMinutes(dto.getDurationMinutes())
                .build();
    }
}

