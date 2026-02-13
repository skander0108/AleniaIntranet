package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ItSupportAttachmentDto;
import com.iberia.intranet.entity.ItSupportAttachment;
import org.springframework.stereotype.Component;

@Component
public class ItSupportAttachmentMapper {

    public ItSupportAttachmentDto toDto(ItSupportAttachment entity) {
        if (entity == null) {
            return null;
        }

        return ItSupportAttachmentDto.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
