package uz.verifix.jobs.integration.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Component
public class PaymeClient implements PaymentGatewayClient {

    private final String merchantId;
    private final String secretKey;
    private final String baseUrl;
    private final String checkoutUrl;
    private final WebClient webClient;

    public PaymeClient(
            @Value("${app.payment.payme.merchant-id:}") String merchantId,
            @Value("${app.payment.payme.secret-key:}") String secretKey,
            @Value("${app.payment.payme.base-url:https://checkout.paycom.uz}") String baseUrl) {
        this.merchantId = merchantId;
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
        this.checkoutUrl = baseUrl;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Basic " +
                        Base64.getEncoder().encodeToString(("Paycom:" + secretKey).getBytes(StandardCharsets.UTF_8)))
                .build();
    }

    @Override
    public PaymentInitResult initiatePayment(String orderId, BigDecimal amount, String returnUrl) {
        try {
            // Payme amount is in tiyin (1 UZS = 100 tiyin)
            long amountInTiyin = amount.longValue() * 100;

            // Build checkout URL with base64 encoded params
            String params = "m=" + merchantId +
                    ";ac.order_id=" + orderId +
                    ";a=" + amountInTiyin +
                    ";c=" + returnUrl;
            String encodedParams = Base64.getEncoder().encodeToString(params.getBytes(StandardCharsets.UTF_8));
            String redirectUrl = checkoutUrl + "/" + encodedParams;

            log.info("Payme payment initiated: orderId={}, amount={} UZS", orderId, amount);
            return new PaymentInitResult(orderId, redirectUrl, true, null);
        } catch (Exception e) {
            log.error("Payme payment init failed: {}", e.getMessage());
            return new PaymentInitResult(null, null, false, e.getMessage());
        }
    }

    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        String method = params.get("method");
        String transactionId = params.get("id");
        String orderId = params.get("order_id");
        String authHeader = params.get("authorization");

        // Verify authorization
        if (!verifyAuth(authHeader)) {
            log.warn("Payme invalid auth for transaction {}", transactionId);
            return new PaymentCallbackResult(orderId, transactionId, false, "Invalid authorization");
        }

        boolean paid = "PerformTransaction".equals(method);
        log.info("Payme callback: method={}, transId={}, orderId={}, paid={}", method, transactionId, orderId, paid);
        return new PaymentCallbackResult(orderId, transactionId, paid, null);
    }

    @Override
    public PaymentStatusResult checkStatus(String externalId) {
        log.debug("Payme status check for: {}", externalId);
        return new PaymentStatusResult(externalId, "UNKNOWN", false);
    }

    private boolean verifyAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Basic ")) return false;
        try {
            String decoded = new String(Base64.getDecoder().decode(authHeader.substring(6)), StandardCharsets.UTF_8);
            String expected = "Paycom:" + secretKey;
            return MessageDigest.isEqual(
                    decoded.getBytes(StandardCharsets.UTF_8), expected.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}
