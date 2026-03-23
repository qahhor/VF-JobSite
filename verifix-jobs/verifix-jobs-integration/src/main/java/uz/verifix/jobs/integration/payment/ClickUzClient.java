package uz.verifix.jobs.integration.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Component
public class ClickUzClient implements PaymentGatewayClient {

    private final String merchantId;
    private final String serviceId;
    private final String secretKey;
    private final String baseUrl;
    private final WebClient webClient;

    public ClickUzClient(
            @Value("${app.payment.click.merchant-id:}") String merchantId,
            @Value("${app.payment.click.service-id:}") String serviceId,
            @Value("${app.payment.click.secret-key:}") String secretKey,
            @Value("${app.payment.click.base-url:https://my.click.uz}") String baseUrl) {
        this.merchantId = merchantId;
        this.serviceId = serviceId;
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public PaymentInitResult initiatePayment(String orderId, BigDecimal amount, String returnUrl) {
        try {
            String redirectUrl = baseUrl + "/services/pay" +
                    "?service_id=" + serviceId +
                    "&merchant_id=" + merchantId +
                    "&amount=" + amount.longValue() +
                    "&transaction_param=" + orderId +
                    "&return_url=" + returnUrl;

            log.info("Click.uz payment initiated: orderId={}, amount={}", orderId, amount);
            return new PaymentInitResult(orderId, redirectUrl, true, null);
        } catch (Exception e) {
            log.error("Click.uz payment init failed: {}", e.getMessage());
            return new PaymentInitResult(null, null, false, e.getMessage());
        }
    }

    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        String clickTransId = params.get("click_trans_id");
        String merchantTransId = params.get("merchant_trans_id");
        String amount = params.get("amount");
        String signString = params.get("sign_string");
        String error = params.get("error");
        String action = params.get("action");

        // Verify signature
        String expectedSign = generateSignature(clickTransId, merchantTransId, amount, action);
        if (!expectedSign.equals(signString)) {
            log.warn("Click.uz invalid signature for transaction {}", clickTransId);
            return new PaymentCallbackResult(merchantTransId, clickTransId, false, "Invalid signature");
        }

        boolean paid = "0".equals(error) && "1".equals(action);
        log.info("Click.uz callback: transId={}, orderId={}, paid={}", clickTransId, merchantTransId, paid);
        return new PaymentCallbackResult(merchantTransId, clickTransId, paid, error);
    }

    @Override
    public PaymentStatusResult checkStatus(String externalId) {
        // Click.uz doesn't have a simple status check API — status comes via callback
        log.debug("Click.uz status check for: {}", externalId);
        return new PaymentStatusResult(externalId, "UNKNOWN", false);
    }

    private String generateSignature(String clickTransId, String merchantTransId, String amount, String action) {
        try {
            String data = clickTransId + serviceId + secretKey + merchantTransId + amount + action + secretKey;
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Signature generation failed", e);
        }
    }
}
