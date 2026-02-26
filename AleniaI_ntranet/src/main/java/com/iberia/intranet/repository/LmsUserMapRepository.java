package com.iberia.intranet.repository;

import com.iberia.intranet.entity.lms.LmsUserMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LmsUserMapRepository extends JpaRepository<LmsUserMap, UUID> {
    Optional<LmsUserMap> findByIspringUserId(String ispringUserId);

    Optional<LmsUserMap> findByEmail(String email);
}
