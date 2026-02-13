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
public class ItSupportCommentDto {

    private UUID id;
    private UUID authorId;
    private String authorName;
    private String message;
    private ZonedDateTime createdAt;
}
