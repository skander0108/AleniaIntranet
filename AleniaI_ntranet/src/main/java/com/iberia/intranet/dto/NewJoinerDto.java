package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewJoinerDto {
    private UUID id;
    private String fullName;
    private String jobTitle;
    private String department;
    private LocalDate startDate;
    private String location;
    private String photoUrl;
    private String cvFileId;
    private String cvFileName;
    private String cvMimeType;
    private Long cvSizeBytes;
}
