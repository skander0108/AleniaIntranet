package com.iberia.intranet.service;

import com.iberia.intranet.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    Page<UserDto> list(Pageable pageable);

    UserDto get(UUID id);

    UserDto create(UserDto dto);

    UserDto update(UUID id, UserDto dto);

    void delete(UUID id);

    com.iberia.intranet.entity.User getCurrentUser();
}
