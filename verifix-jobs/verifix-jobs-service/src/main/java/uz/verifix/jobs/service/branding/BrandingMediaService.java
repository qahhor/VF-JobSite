package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.branding.*;
import uz.verifix.jobs.domain.enums.BrandingTier;
import uz.verifix.jobs.domain.enums.GalleryCategory;
import uz.verifix.jobs.domain.enums.VideoType;
import uz.verifix.jobs.domain.repository.branding.*;
import uz.verifix.jobs.integration.storage.FileStorageService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingMediaService {

    private static final long MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_GALLERY_SIZE = 1024 * 1024; // 1MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final int MAX_COVERS_BRANDED = 1;
    private static final int MAX_COVERS_PREMIUM = 5;
    private static final int MAX_VIDEOS = 3;

    private final EmployerBrandingRepository brandingRepository;
    private final BrandingCoverImageRepository coverImageRepository;
    private final BrandingGalleryRepository galleryRepository;
    private final BrandingGalleryImageRepository galleryImageRepository;
    private final BrandingVideoRepository videoRepository;
    private final FileStorageService fileStorageService;

    // ==================== COVER IMAGES ====================

    @Transactional
    public BrandingCoverImage uploadCoverImage(UUID employerId, MultipartFile file) throws IOException {
        EmployerBranding branding = getByEmployer(employerId);
        validateImageFile(file, MAX_COVER_SIZE);

        int maxCovers = branding.getTier() == BrandingTier.PREMIUM ? MAX_COVERS_PREMIUM : MAX_COVERS_BRANDED;
        long currentCount = coverImageRepository.countByBrandingId(branding.getId());
        if (currentCount >= maxCovers) {
            throw new BusinessException("COVER_LIMIT", "Maximum " + maxCovers + " cover images allowed for " + branding.getTier(),
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        String url = fileStorageService.upload("branding-covers", file.getOriginalFilename(),
                file.getInputStream(), file.getContentType(), file.getSize());

        BrandingCoverImage cover = BrandingCoverImage.builder()
                .branding(branding)
                .imageUrl(url)
                .sortOrder((int) currentCount)
                .build();
        return coverImageRepository.save(cover);
    }

    @Transactional
    public void deleteCoverImage(UUID employerId, UUID imageId) {
        EmployerBranding branding = getByEmployer(employerId);
        BrandingCoverImage cover = coverImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("CoverImage", imageId.toString()));
        if (!cover.getBranding().getId().equals(branding.getId())) {
            throw new ForbiddenException("Cover image does not belong to this employer");
        }
        coverImageRepository.delete(cover);
    }

    @Transactional
    public void reorderCovers(UUID employerId, List<UUID> orderedIds) {
        EmployerBranding branding = getByEmployer(employerId);
        List<BrandingCoverImage> covers = coverImageRepository.findByBrandingIdOrderBySortOrder(branding.getId());
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID id = orderedIds.get(i);
            covers.stream().filter(c -> c.getId().equals(id)).findFirst()
                    .ifPresent(c -> c.setSortOrder(orderedIds.indexOf(c.getId())));
        }
        coverImageRepository.saveAll(covers);
    }

    // ==================== GALLERY ====================

    @Transactional
    public BrandingGallery createGallery(UUID employerId, GalleryCategory category, String title) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);

        BrandingGallery gallery = BrandingGallery.builder()
                .branding(branding)
                .category(category)
                .title(title)
                .build();
        return galleryRepository.save(gallery);
    }

    @Transactional
    public BrandingGalleryImage uploadGalleryImage(UUID employerId, UUID galleryId, MultipartFile file) throws IOException {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);

        BrandingGallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery", galleryId.toString()));
        validateImageFile(file, MAX_GALLERY_SIZE);

        String url = fileStorageService.upload("branding-gallery", file.getOriginalFilename(),
                file.getInputStream(), file.getContentType(), file.getSize());

        BrandingGalleryImage image = BrandingGalleryImage.builder()
                .gallery(gallery)
                .imageUrl(url)
                .build();
        return galleryImageRepository.save(image);
    }

    @Transactional
    public void deleteGalleryImage(UUID employerId, UUID galleryId, UUID imageId) {
        getByEmployer(employerId);
        galleryImageRepository.deleteById(imageId);
    }

    // ==================== VIDEO ====================

    @Transactional
    public BrandingVideo addVideo(UUID employerId, VideoType videoType, String videoUrl, String title) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);

        long count = videoRepository.countByBrandingId(branding.getId());
        if (count >= MAX_VIDEOS) {
            throw new BusinessException("VIDEO_LIMIT", "Maximum " + MAX_VIDEOS + " videos allowed",
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        String thumbnailUrl = null;
        if (videoType == VideoType.YOUTUBE) {
            thumbnailUrl = extractYouTubeThumbnail(videoUrl);
        }

        BrandingVideo video = BrandingVideo.builder()
                .branding(branding)
                .videoType(videoType)
                .videoUrl(videoUrl)
                .thumbnailUrl(thumbnailUrl)
                .title(title)
                .sortOrder((int) count)
                .build();
        return videoRepository.save(video);
    }

    @Transactional
    public void deleteVideo(UUID employerId, UUID videoId) {
        getByEmployer(employerId);
        videoRepository.deleteById(videoId);
    }

    // ==================== HELPERS ====================

    private EmployerBranding getByEmployer(UUID employerId) {
        return brandingRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployerBranding", employerId.toString()));
    }

    private void requireTier(EmployerBranding branding, BrandingTier required) {
        if (branding.getTier().ordinal() < required.ordinal()) {
            throw new ForbiddenException("This feature requires " + required + " branding tier. Please upgrade.");
        }
    }

    private void validateImageFile(MultipartFile file, long maxSize) {
        if (file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "File is empty", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > maxSize) {
            throw new BusinessException("FILE_TOO_LARGE", "File exceeds maximum size of " + (maxSize / 1024 / 1024) + "MB",
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new BusinessException("INVALID_FILE_TYPE", "Only JPEG, PNG, and WebP images are allowed",
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }

    private String extractYouTubeThumbnail(String url) {
        String videoId = null;
        if (url.contains("youtu.be/")) {
            videoId = url.substring(url.lastIndexOf("/") + 1).split("\\?")[0];
        } else if (url.contains("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        }
        return videoId != null ? "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg" : null;
    }
}
