package uz.verifix.jobs.integration.payment;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGatewayClient {

    PaymentInitResult initiatePayment(String orderId, BigDecimal amount, String returnUrl);

    PaymentCallbackResult verifyCallback(Map<String, String> params);

    PaymentStatusResult checkStatus(String externalId);

    record PaymentInitResult(String externalId, String redirectUrl, boolean success, String error) {}

    record PaymentCallbackResult(String orderId, String externalId, boolean paid, String error) {}

    record PaymentStatusResult(String externalId, String status, boolean paid) {}
}
