package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Enrollment;
import com.iberia.intranet.entity.Training;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByUser(User user);

    List<Enrollment> findByTraining(Training training);

    Optional<Enrollment> findByUserAndTraining(User user, Training training);
}

