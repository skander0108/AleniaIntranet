package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.NewJoinerDto;
import com.iberia.intranet.entity.NewJoiner;

public class NewJoinerMapper {

    private NewJoinerMapper() {
    }

    public static NewJoinerDto toDto(NewJoiner entity) {
        return NewJoinerDto.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .jobTitle(entity.getJobTitle())
                .department(entity.getDepartment())
                .startDate(entity.getStartDate())
                .location(entity.getLocation())
                .photoUrl(entity.getPhotoUrl())
                .build();
    }
}
