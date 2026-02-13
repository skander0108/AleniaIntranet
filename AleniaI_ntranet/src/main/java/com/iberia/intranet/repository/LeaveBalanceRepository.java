package com.iberia.intranet.repository;

import com.iberia.intranet.entity.LeaveBalance;
import com.iberia.intranet.entity.LeaveType;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {
    List<LeaveBalance> findByEmployeeAndYear(User employee, Integer year);

    Optional<LeaveBalance> findByEmployeeAndLeaveTypeAndYear(User employee, LeaveType leaveType, Integer year);
}
