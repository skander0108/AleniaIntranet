package com.iberia.intranet.repository;

import com.iberia.intranet.entity.NewJoiner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NewJoinerRepository extends JpaRepository<NewJoiner, UUID> {
}
