package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TrainingRepository extends JpaRepository<Training, UUID> {
}

