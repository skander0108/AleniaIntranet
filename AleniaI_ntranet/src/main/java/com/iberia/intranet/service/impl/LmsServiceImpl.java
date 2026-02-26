package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.LmsProgressDto;
import com.iberia.intranet.dto.LmsSyncLogDto;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.entity.lms.LmsProgress;
import com.iberia.intranet.entity.lms.LmsSyncLog;
import com.iberia.intranet.repository.LmsProgressRepository;
import com.iberia.intranet.repository.LmsSyncLogRepository;
import com.iberia.intranet.repository.LmsUserMapRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.LmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LmsServiceImpl implements LmsService {

    private final LmsProgressRepository progressRepository;
    private final LmsSyncLogRepository syncLogRepository;
    private final UserRepository userRepository;
    private final LmsUserMapRepository userMapRepository;
    private final com.iberia.intranet.service.ISpringRestClient ispringRestClient;
    // Self-injection to make @Cacheable work when called from within the same class
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private LmsServiceImpl self;

    @Override
    public List<LmsProgressDto> getMyProgress(User user) {
        return mapToDto(progressRepository.findByUser(user));
    }

    @Override
    public List<LmsProgressDto> getTeamProgress(User manager) {
        List<User> subordinates = userRepository.findByManager(manager);
        return mapToDto(progressRepository.findByUserIn(subordinates));
    }

    @Override
    public List<LmsProgressDto> getGlobalProgress() {
        return mapToDto(progressRepository.findAll());
    }

    @Override
    @Transactional
    public LmsSyncLogDto triggerSync() {
        LmsSyncLog syncLog = LmsSyncLog.builder()
                .syncType("FULL")
                .status("STARTED")
                .startedAt(LocalDateTime.now())
                .build();
        syncLog = syncLogRepository.save(syncLog);

        try {
            log.info("Starting LMS sync...");

            List<com.iberia.intranet.dto.ispring.ISpringLearnerResult> results = ispringRestClient
                    .getAllLearnerProgress();

            int processedCount = 0;
            if (results != null) {
                for (com.iberia.intranet.dto.ispring.ISpringLearnerResult result : results) {
                    try {
                        processResult(result);
                        processedCount++;
                    } catch (Exception e) {
                        log.error("Failed to process result for user {}: {}", result.getUserId(), e.getMessage());
                    }
                }
            }

            syncLog.setStatus("COMPLETED");
            syncLog.setMessage("LMS Sync completed successfully.");
            syncLog.setFinishedAt(LocalDateTime.now());
            syncLog.setRecordsCount(processedCount);
        } catch (Exception e) {
            log.error("LMS Sync failed", e);
            syncLog.setStatus("FAILED");
            syncLog.setMessage(e.getMessage());
            syncLog.setFinishedAt(LocalDateTime.now());
        }

        syncLog = syncLogRepository.save(syncLog);
        return mapSyncLogToDto(syncLog);
    }

    @Transactional
    protected void processResult(com.iberia.intranet.dto.ispring.ISpringLearnerResult result) {
        // 1. Resolve User
        // We assume iSpring user_id is the link, or we try to match by email if we have
        // it in result (we don't in basic result, maybe need extra call if not found)
        // Actually, let's try to map by creating LmsUserMap if it doesn't exist? No, we
        // need a local user to map TO.
        // For now, assume we can match strictly by existing map OR we try to match User
        // by email if iSpring provides it?
        // The DTO I created doesn't have email. The /learners/modules/results usually
        // has user_id.
        // If we can't link, we skip or log warning.

        // However, we can try to find LmsUserMap by iSpringId.
        Optional<com.iberia.intranet.entity.lms.LmsUserMap> userMapOpt = userMapRepository
                .findByIspringUserId(result.getUserId());
        User localUser = null;

        if (userMapOpt.isPresent()) {
            localUser = userMapOpt.get().getLocalUser();
        } else {
            com.iberia.intranet.dto.ispring.ISpringUserProfile profile = ispringRestClient
                    .getUserProfile(result.getUserId());
            String email = null;
            if (profile != null && profile.getFields() != null) {
                for (com.iberia.intranet.dto.ispring.ISpringUserProfile.ISpringUserField field : profile.getFields()) {
                    if ("EMAIL".equalsIgnoreCase(field.getName())) {
                        email = field.getValue();
                        break;
                    }
                }
            }

            if (email != null && !email.isBlank()) {
                Optional<User> localUserOpt = userRepository.findByEmail(email);
                if (localUserOpt.isPresent()) {
                    localUser = localUserOpt.get();
                    com.iberia.intranet.entity.lms.LmsUserMap newMap = com.iberia.intranet.entity.lms.LmsUserMap
                            .builder()
                            .localUser(localUser)
                            .ispringUserId(result.getUserId())
                            .email(email)
                            .createdAt(LocalDateTime.now())
                            .build();
                    userMapRepository.save(newMap);
                    log.info("Successfully mapped iSpring user {} to local user {}", result.getUserId(), email);
                } else {
                    log.warn("iSpring user {} has email {} but no matching local user found.", result.getUserId(),
                            email);
                    return;
                }
            } else {
                log.warn("Skipping progress for iSpring user {}: no email found in profile.", result.getUserId());
                return;
            }
        }

        // 2. Upsert Progress
        com.iberia.intranet.entity.lms.LmsProgress progress = progressRepository
                .findByUserIdAndIspringCourseId(localUser.getId(), result.getCourseId())
                .orElse(com.iberia.intranet.entity.lms.LmsProgress.builder()
                        .user(localUser)
                        .ispringCourseId(result.getCourseId())
                        .build());

        progress.setTitle(result.getCourseTitle());
        progress.setType(result.getCourseType());
        progress.setStatus(result.getStatus());
        progress.setScore(result.getScore());
        progress.setMaxScore(result.getMaxScore());
        progress.setTimeSpent(result.getTimeSpent());
        progress.setUpdatedAt(LocalDateTime.now());

        // Parse completion date (ISO)
        if (result.getCompletionDate() != null) {
            try {
                // iSpring likely returns "2023-01-01" or ISO. Using generic parser or
                // LocalDateTime.parse logic.
                // Assuming standard ISO8601
                // If format is date only: LocalDate.parse(...).atStartOfDay()
                // If format is datetime: ZonedDateTime or LocalDateTime
                // Using simple approach, catching exception if fails
                progress.setCompletionDate(java.time.LocalDate.parse(result.getCompletionDate()).atStartOfDay());
            } catch (Exception e) {
                log.warn("Could not parse date: {}", result.getCompletionDate());
            }
        }

        try {
            // Store raw JSON for debug (simple generic dump)
            progress.setRawJson(result.toString());
        } catch (Exception ignored) {
        }

        progressRepository.save(progress);
    }

    @Override
    public List<LmsSyncLogDto> getSyncLogs() {
        return syncLogRepository.findAllByOrderByStartedAtDesc()
                .stream()
                .map(this::mapSyncLogToDto)
                .toList();
    }

    @Override
    public Page<com.iberia.intranet.dto.LmsUserCourseProgressDto> getPaginatedUsersProgress(Pageable pageable,
            String search) {
        List<com.iberia.intranet.dto.LmsUserCourseProgressDto> allData = self.fetchAllMergedLmsProgress();

        // 1. Apply search filter First
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            allData = allData.stream()
                    .filter(item -> (item.getUserFullName() != null
                            && item.getUserFullName().toLowerCase().contains(lowerSearch)) ||
                            (item.getEmail() != null && item.getEmail().toLowerCase().contains(lowerSearch)) ||
                            (item.getCourseTitle() != null && item.getCourseTitle().toLowerCase().contains(lowerSearch))
                            ||
                            (item.getCourseType() != null && item.getCourseType().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allData.size());

        List<com.iberia.intranet.dto.LmsUserCourseProgressDto> pageContent;
        if (start <= end) {
            pageContent = allData.subList(start, end);
        } else {
            pageContent = new ArrayList<>();
        }

        return new PageImpl<>(pageContent, pageable, allData.size());
    }

    @Cacheable("lmsProgressCache")
    public List<com.iberia.intranet.dto.LmsUserCourseProgressDto> fetchAllMergedLmsProgress() {
        log.info("Cache miss for LMS progress. Fetching fresh data from iSpring API...");
        List<com.iberia.intranet.dto.ispring.ISpringLearnerResult> apiResults;
        try {
            apiResults = ispringRestClient.getAllLearnerProgress();
        } catch (Exception e) {
            log.error("Failed to fetch LMS progress from API", e);
            return new ArrayList<>();
        }

        if (apiResults == null || apiResults.isEmpty()) {
            return new ArrayList<>();
        }

        // 1. Pre-filter apiResults to only keep the latest progress per ispringUserId
        Map<String, com.iberia.intranet.dto.ispring.ISpringLearnerResult> latestApiResultsMap = apiResults.stream()
                .collect(Collectors.toMap(
                        com.iberia.intranet.dto.ispring.ISpringLearnerResult::getUserId,
                        Function.identity(),
                        (existing, replacement) -> {
                            java.time.LocalDate existingDate = null;
                            java.time.LocalDate replacementDate = null;
                            try {
                                if (existing.getCompletionDate() != null)
                                    existingDate = java.time.LocalDate.parse(existing.getCompletionDate());
                                if (replacement.getCompletionDate() != null)
                                    replacementDate = java.time.LocalDate.parse(replacement.getCompletionDate());
                            } catch (Exception ignored) {
                            }

                            if (existingDate != null && replacementDate != null) {
                                return existingDate.isAfter(replacementDate) ? existing : replacement;
                            }
                            if (existingDate != null)
                                return existing;
                            if (replacementDate != null)
                                return replacement;
                            return existing; // Both null, just keep existing
                        }));

        // Fetch user maps to map iSpring user IDs to local user info
        List<com.iberia.intranet.entity.lms.LmsUserMap> userMaps = userMapRepository.findAll();
        Map<String, com.iberia.intranet.entity.lms.LmsUserMap> mapByIspringId = userMaps.stream()
                .collect(Collectors.toMap(com.iberia.intranet.entity.lms.LmsUserMap::getIspringUserId,
                        Function.identity()));

        List<com.iberia.intranet.dto.LmsUserCourseProgressDto> mergedResults = new ArrayList<>();
        Map<String, String[]> unmappedUserProfiles = new java.util.HashMap<>();

        // Now we only iterate over the *unique* latest results
        for (com.iberia.intranet.dto.ispring.ISpringLearnerResult result : latestApiResultsMap.values()) {
            com.iberia.intranet.dto.LmsUserCourseProgressDto dto = com.iberia.intranet.dto.LmsUserCourseProgressDto
                    .builder()
                    .ispringUserId(result.getUserId())
                    .courseId(result.getCourseId())
                    .courseTitle(result.getCourseTitle())
                    .courseType(result.getCourseType())
                    .status(result.getStatus())
                    .score(result.getScore())
                    .maxScore(result.getMaxScore())
                    .timeSpent(result.getTimeSpent())
                    .build();

            // Parse date
            if (result.getCompletionDate() != null) {
                try {
                    dto.setCompletionDate(java.time.LocalDate.parse(result.getCompletionDate()).atStartOfDay());
                } catch (Exception ignored) {
                }
            }

            // Decorate with local User info if mapped
            com.iberia.intranet.entity.lms.LmsUserMap mapping = mapByIspringId.get(result.getUserId());
            if (mapping != null && mapping.getLocalUser() != null) {
                dto.setUserFullName(mapping.getLocalUser().getFullName());
                dto.setEmail(mapping.getLocalUser().getEmail());
            } else {
                if (!unmappedUserProfiles.containsKey(result.getUserId())) {
                    com.iberia.intranet.dto.ispring.ISpringUserProfile profile = ispringRestClient
                            .getUserProfile(result.getUserId());
                    String firstName = "";
                    String lastName = "";
                    String email = "";
                    if (profile != null && profile.getFields() != null) {
                        for (com.iberia.intranet.dto.ispring.ISpringUserProfile.ISpringUserField field : profile
                                .getFields()) {
                            if ("EMAIL".equalsIgnoreCase(field.getName()))
                                email = field.getValue();
                            if ("FIRST_NAME".equalsIgnoreCase(field.getName()))
                                firstName = field.getValue();
                            if ("LAST_NAME".equalsIgnoreCase(field.getName()))
                                lastName = field.getValue();
                        }
                    }
                    String fullName = (firstName + " " + lastName).trim();
                    if (fullName.isEmpty())
                        fullName = "Unknown User ("
                                + result.getUserId().substring(0, Math.min(8, result.getUserId().length())) + ")";
                    unmappedUserProfiles.put(result.getUserId(), new String[] { fullName, email });
                }
                String[] profileData = unmappedUserProfiles.get(result.getUserId());
                dto.setUserFullName(profileData[0]);
                dto.setEmail(profileData[1]);
            }

            mergedResults.add(dto);
        }

        return mergedResults;
    }

    // ---- Mapping helpers (entity -> DTO) ----

    private List<LmsProgressDto> mapToDto(List<LmsProgress> progressList) {
        // Group by user ID and course ID, keeping only the latest progress (by
        // completionDate or update time)
        Map<String, LmsProgress> latestProgressMap = progressList.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId().toString() + "_" + p.getIspringCourseId(),
                        Function.identity(),
                        (p1, p2) -> {
                            LocalDateTime t1 = p1.getCompletionDate() != null ? p1.getCompletionDate()
                                    : p1.getUpdatedAt();
                            LocalDateTime t2 = p2.getCompletionDate() != null ? p2.getCompletionDate()
                                    : p2.getUpdatedAt();
                            if (t1 == null)
                                return p2;
                            if (t2 == null)
                                return p1;
                            return t1.isAfter(t2) ? p1 : p2;
                        }));

        return latestProgressMap.values().stream()
                .map(p -> LmsProgressDto.builder()
                        .id(p.getId())
                        .userId(p.getUser().getId())
                        .userFullName(p.getUser().getFullName())
                        .courseId(p.getIspringCourseId())
                        .courseTitle(p.getTitle())
                        .courseType(p.getType())
                        .status(p.getStatus())
                        .completionDate(p.getCompletionDate())
                        .score(p.getScore())
                        .maxScore(p.getMaxScore())
                        .updatedAt(p.getUpdatedAt())
                        .build())
                .sorted(Comparator.comparing(LmsProgressDto::getUpdatedAt).reversed())
                .toList();
    }

    private LmsSyncLogDto mapSyncLogToDto(LmsSyncLog log) {
        return LmsSyncLogDto.builder()
                .id(log.getId())
                .syncType(log.getSyncType())
                .status(log.getStatus())
                .startedAt(log.getStartedAt())
                .finishedAt(log.getFinishedAt())
                .message(log.getMessage())
                .recordsCount(log.getRecordsCount())
                .build();
    }
}
