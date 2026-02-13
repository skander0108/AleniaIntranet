package com.iberia.intranet.controller;

import com.iberia.intranet.dto.EnrollmentDto;
import com.iberia.intranet.repository.EnrollmentRepository;
import com.iberia.intranet.mapper.EnrollmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springdoc.core.annotations.ParameterObject;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;

    @GetMapping
    public Page<EnrollmentDto> list(@ParameterObject Pageable pageable) {
        return enrollmentRepository.findAll(pageable).map(EnrollmentMapper::toDto);
    }
}


