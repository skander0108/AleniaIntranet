package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ItSupportAuditLogDto;
import com.iberia.intranet.entity.ItSupportAuditLog;
import org.springframework.stereotype.Component;

@Component
public class ItSupportAuditLogMapper {

    public ItSupportAuditLogDto toDto(ItSupportAuditLog log) {
        if (log == null)
            return null;

        return ItSupportAuditLogDto.builder()
                .id(log.getId())
                .action(log.getAction())
                .changedByFullName(log.getChangedBy() != null ? log.getChangedBy().getFullName() : "System")
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .timestamp(log.getTimestamp())
                .build();
    }
}
