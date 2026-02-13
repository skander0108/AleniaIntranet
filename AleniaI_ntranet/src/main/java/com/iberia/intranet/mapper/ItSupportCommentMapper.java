package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.entity.ItSupportComment;
import com.iberia.intranet.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ItSupportCommentMapper {

    public ItSupportCommentDto toDto(ItSupportComment entity) {
        if (entity == null) {
            return null;
        }

        return ItSupportCommentDto.builder()
                .id(entity.getId())
                .authorId(entity.getAuthor().getId())
                .authorName(getUserFullName(entity.getAuthor()))
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private String getUserFullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFullName();
    }
}
