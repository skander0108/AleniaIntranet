package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.NewJoinerDto;
import com.iberia.intranet.entity.NewJoiner;
import com.iberia.intranet.mapper.NewJoinerMapper;
import com.iberia.intranet.repository.NewJoinerRepository;
import com.iberia.intranet.service.NewJoinerService;
import com.iberia.intranet.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewJoinerServiceImpl implements NewJoinerService {

    private final NewJoinerRepository newJoinerRepository;
    private final NotificationService notificationService;

    // Directory relative to execution path
    private final Path fileStorageLocation = Paths.get("uploads/joiners").toAbsolutePath().normalize();

    @Override
    public List<NewJoinerDto> getAllJoiners() {
        return newJoinerRepository.findAll().stream()
                .map(NewJoinerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<NewJoinerDto> getAllJoiners(
            org.springframework.data.domain.Pageable pageable) {
        return newJoinerRepository.findAll(pageable)
                .map(NewJoinerMapper::toDto);
    }

    @Override
    public NewJoinerDto getJoiner(UUID id) {
        NewJoiner joiner = newJoinerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("New Joiner not found"));
        return NewJoinerMapper.toDto(joiner);
    }

    @Override
    @Transactional
    public NewJoinerDto createJoiner(String fullName, String jobTitle, String department, LocalDate startDate,
            String location, MultipartFile photo, MultipartFile cv) {
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = storeFile(photo, "images");
        }

        NewJoiner.NewJoinerBuilder builder = NewJoiner.builder()
                .fullName(fullName)
                .jobTitle(jobTitle)
                .department(department)
                .startDate(startDate)
                .location(location)
                .photoUrl(photoUrl);

        if (cv != null && !cv.isEmpty()) {
            storeCv(cv, builder);
        }

        NewJoiner joiner = builder.build();
        NewJoiner saved = newJoinerRepository.save(joiner);

        // Create notification for new joiner
        notificationService.notifyJoinerCreated(saved.getId(), fullName, jobTitle);

        return NewJoinerMapper.toDto(saved);
    }

    @Override
    @Transactional
    public NewJoinerDto updateJoiner(UUID id, String fullName, String jobTitle, String department, LocalDate startDate,
            String location, MultipartFile photo, MultipartFile cv) {
        NewJoiner joiner = newJoinerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("New Joiner not found"));

        joiner.setFullName(fullName);
        joiner.setJobTitle(jobTitle);
        joiner.setDepartment(department);
        joiner.setStartDate(startDate);
        joiner.setLocation(location);

        if (photo != null && !photo.isEmpty()) {
            String photoUrl = storeFile(photo, "images");
            joiner.setPhotoUrl(photoUrl);
        }

        if (cv != null && !cv.isEmpty()) {
            // Logic to replace CV could go here, for now just overwrite fields
            updateCv(cv, joiner);
        }

        return NewJoinerMapper.toDto(newJoinerRepository.save(joiner));
    }

    @Override
    public org.springframework.core.io.Resource getJoinerCv(UUID id) {
        NewJoiner joiner = newJoinerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("New Joiner not found"));

        if (joiner.getCvFileId() == null) {
            throw new RuntimeException("No CV found for this joiner");
        }

        try {
            Path filePath = fileStorageLocation.resolve("cvs").resolve(joiner.getCvFileId()).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(
                    filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("CV file not found on server");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found", e);
        }
    }

    @Override
    @Transactional
    public void deleteJoiner(UUID id) {
        // Optionally delete the file too
        newJoinerRepository.deleteById(id);
    }

    private String storeFile(MultipartFile file, String subDir) {
        try {
            Path targetDir = fileStorageLocation.resolve(subDir);
            Files.createDirectories(targetDir);

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                extension = originalFileName.substring(i);
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/api/joiners/" + subDir + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!",
                    ex);
        }
    }

    private void storeCv(MultipartFile cv, NewJoiner.NewJoinerBuilder builder) {
        try {
            Path targetDir = fileStorageLocation.resolve("cvs");
            Files.createDirectories(targetDir);

            String originalFileName = StringUtils.cleanPath(cv.getOriginalFilename());
            String fileId = UUID.randomUUID().toString()
                    + (originalFileName.contains(".") ? originalFileName.substring(originalFileName.lastIndexOf("."))
                            : "");

            Path targetLocation = targetDir.resolve(fileId);
            Files.copy(cv.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            builder.cvFileId(fileId)
                    .cvFileName(originalFileName)
                    .cvMimeType(cv.getContentType())
                    .cvSizeBytes(cv.getSize());

        } catch (IOException ex) {
            throw new RuntimeException("Could not store CV " + cv.getOriginalFilename(), ex);
        }
    }

    private void updateCv(MultipartFile cv, NewJoiner joiner) {
        try {
            Path targetDir = fileStorageLocation.resolve("cvs");
            Files.createDirectories(targetDir);

            String originalFileName = StringUtils.cleanPath(cv.getOriginalFilename());
            String fileId = UUID.randomUUID().toString()
                    + (originalFileName.contains(".") ? originalFileName.substring(originalFileName.lastIndexOf("."))
                            : "");

            Path targetLocation = targetDir.resolve(fileId);
            Files.copy(cv.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            joiner.setCvFileId(fileId);
            joiner.setCvFileName(originalFileName);
            joiner.setCvMimeType(cv.getContentType());
            joiner.setCvSizeBytes(cv.getSize());

        } catch (IOException ex) {
            throw new RuntimeException("Could not store CV " + cv.getOriginalFilename(), ex);
        }
    }
}
