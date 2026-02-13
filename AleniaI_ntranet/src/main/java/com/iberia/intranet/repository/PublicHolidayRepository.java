package com.iberia.intranet.repository;

import com.iberia.intranet.entity.PublicHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, UUID> {

    @Query("SELECT ph.date FROM PublicHoliday ph WHERE ph.date BETWEEN :startDate AND :endDate")
    List<LocalDate> findHolidaysBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
