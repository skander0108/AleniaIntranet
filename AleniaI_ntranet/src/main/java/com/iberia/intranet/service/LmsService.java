package com.iberia.intranet.service;

import com.iberia.intranet.dto.LmsProgressDto;
import com.iberia.intranet.dto.LmsSyncLogDto;
import com.iberia.intranet.dto.LmsUserCourseProgressDto;
import com.iberia.intranet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LmsService {

    List<LmsProgressDto> getMyProgress(User user);

    List<LmsProgressDto> getTeamProgress(User manager);

    List<LmsProgressDto> getGlobalProgress();

    LmsSyncLogDto triggerSync();

    List<LmsSyncLogDto> getSyncLogs();

    Page<LmsUserCourseProgressDto> getPaginatedUsersProgress(Pageable pageable, String search);
}
