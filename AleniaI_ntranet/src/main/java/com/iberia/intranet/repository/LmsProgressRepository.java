package com.iberia.intranet.repository;

import com.iberia.intranet.entity.User;
import com.iberia.intranet.entity.lms.LmsProgress;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LmsProgressRepository extends JpaRepository<LmsProgress, UUID> {

    @EntityGraph(attributePaths = { "user" })
    List<LmsProgress> findAll();

    @EntityGraph(attributePaths = { "user" })
    List<LmsProgress> findByUser(User user);

    @EntityGraph(attributePaths = { "user" })
    List<LmsProgress> findByUserIn(List<User> users);

    Optional<LmsProgress> findByUserIdAndIspringCourseId(UUID userId, String ispringCourseId);
}
