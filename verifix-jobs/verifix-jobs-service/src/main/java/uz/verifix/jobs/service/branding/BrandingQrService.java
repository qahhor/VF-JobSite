package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingQrService {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    private final EmployerBrandingRepository brandingRepository;

    public byte[] generateQr(UUID employerId) {
        EmployerBranding branding = brandingRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployerBranding", employerId.toString()));

        String slug = branding.getCustomSlug() != null ? branding.getCustomSlug() : employerId.toString();
        String url = baseUrl + "/company/" + slug + "?utm_source=qr";

        try {
            // Simple QR-like placeholder image (real QR would use ZXing library)
            BufferedImage image = new BufferedImage(400, 400, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = image.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, 400, 400);
            g.setColor(Color.BLACK);
            g.setFont(new Font("Monospaced", Font.PLAIN, 12));
            g.drawString("QR: " + url, 20, 200);
            g.drawString("Scan with phone camera", 20, 220);
            g.drawRect(10, 10, 380, 380);
            g.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("QR generation failed: {}", e.getMessage());
            return new byte[0];
        }
    }
}
