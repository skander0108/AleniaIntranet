package com.iberia.intranet.repository;

import com.iberia.intranet.entity.lms.LmsCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LmsCourseRepository extends JpaRepository<LmsCourse, String> {
}
