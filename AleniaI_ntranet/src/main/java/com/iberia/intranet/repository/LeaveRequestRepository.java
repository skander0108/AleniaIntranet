package com.iberia.intranet.repository;

import com.iberia.intranet.entity.LeaveRequest;
import com.iberia.intranet.entity.LeaveStatus;
import com.iberia.intranet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

        @Query("SELECT lr FROM LeaveRequest lr " +
                        "WHERE lr.employee.id = :employeeId " +
                        "ORDER BY lr.startDate DESC")
        List<LeaveRequest> findByEmployeeId(@Param("employeeId") UUID employeeId);

        Page<LeaveRequest> findByEmployee(User employee, Pageable pageable);

        @Query("SELECT lr FROM LeaveRequest lr " +
                        "JOIN FETCH lr.employee " +
                        "JOIN FETCH lr.leaveType " +
                        "WHERE lr.employee.id IN :employeeIds " +
                        "AND (:status IS NULL OR lr.status = :status)")
        Page<LeaveRequest> findByEmployeeIdInAndStatus(
                        @Param("employeeIds") List<UUID> employeeIds,
                        @Param("status") LeaveStatus status,
                        Pageable pageable);

        @Query("SELECT lr FROM LeaveRequest lr " +
                        "JOIN FETCH lr.employee " +
                        "JOIN FETCH lr.leaveType " +
                        "WHERE (:status IS NULL OR lr.status = :status)")
        Page<LeaveRequest> findAllWithDetails(
                        @Param("status") LeaveStatus status,
                        Pageable pageable);

        @Query("SELECT lr FROM LeaveRequest lr " +
                        "WHERE lr.employee.id = :employeeId " +
                        "AND lr.status IN :statuses " +
                        "AND (" +
                        "  (lr.startDate <= :endDate AND lr.endDate >= :startDate)" +
                        ")")
        List<LeaveRequest> findOverlappingRequests(
                        @Param("employeeId") UUID employeeId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("statuses") List<LeaveStatus> statuses);
}
