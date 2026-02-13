package com.iberia.intranet.service;

import com.iberia.intranet.dto.NewJoinerDto;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface NewJoinerService {
        List<NewJoinerDto> getAllJoiners();

        org.springframework.data.domain.Page<NewJoinerDto> getAllJoiners(
                        org.springframework.data.domain.Pageable pageable);

        NewJoinerDto getJoiner(UUID id);

        NewJoinerDto createJoiner(String fullName, String jobTitle, String department, LocalDate startDate,
                        String location, MultipartFile photo, MultipartFile cv);

        NewJoinerDto updateJoiner(UUID id, String fullName, String jobTitle, String department, LocalDate startDate,
                        String location, MultipartFile photo, MultipartFile cv);

        org.springframework.core.io.Resource getJoinerCv(UUID id);

        void deleteJoiner(UUID id);
}
