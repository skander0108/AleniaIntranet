package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportAttachmentDto {

    private UUID id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private ZonedDateTime uploadedAt;
}
