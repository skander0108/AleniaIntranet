package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.UserDto;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.UserMapper;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto get(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
        return UserMapper.toDto(user);
    }

    @Override
    public UserDto create(UserDto dto) {
        // Convert DTO to entity (mapper creates TRANSIENT UserRole entities)
        User user = UserMapper.toEntity(dto);
        // Ensure User has no ID for new entity
        user.setId(null);
        // Cascade persist will handle UserRole entities (they are TRANSIENT)
        User saved = userRepository.save(user);
        return UserMapper.toDto(saved);
    }

    @Override
    public UserDto update(UUID id, UserDto dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
        existing.setFullName(dto.getFullName());
        existing.setEmail(dto.getEmail());
        existing.setIsActive(dto.getIsActive());
        // For simplicity roles are not updated here; could be extended.
        return UserMapper.toDto(existing);
    }

    @Override
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));
    }
}
