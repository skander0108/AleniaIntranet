package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ItSupportAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ItSupportAttachmentRepository extends JpaRepository<ItSupportAttachment, UUID> {
}
