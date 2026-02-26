package com.iberia.intranet.repository;

import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findWithRolesByEmail(String email);

    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findWithRolesById(UUID id);

    java.util.List<User> findByManager(User manager);
}
