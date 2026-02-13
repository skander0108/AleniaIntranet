package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.UserDto;
import com.iberia.intranet.entity.RoleType;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.entity.UserRole;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserDto toDto(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(UserRole::getRole)
                .map(Enum::name)
                .collect(Collectors.toSet());

        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .roles(roles)
                .build();
    }

    public static User toEntity(UserDto dto) {
        User user = User.builder()
                .id(dto.getId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .isActive(dto.getIsActive())
                .build();

        if (dto.getRoles() != null) {
            dto.getRoles().forEach(r -> {
                // Create UserRole as TRANSIENT entity (id = null)
                // Hibernate will generate UUID during persist
                UserRole ur = UserRole.builder()
                        .id(null)  // No ID: entity is TRANSIENT
                        .role(RoleType.valueOf(r))
                        .user(user)
                        .build();
                user.getRoles().add(ur);
            });
        }

        return user;
    }
}

