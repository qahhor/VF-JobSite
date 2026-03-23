package uz.verifix.jobs.service.billing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.entity.PricingPlan;
import uz.verifix.jobs.domain.enums.PaymentGateway;
import uz.verifix.jobs.domain.enums.PaymentStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.PaymentRepository;
import uz.verifix.jobs.domain.repository.PricingPlanRepository;
import uz.verifix.jobs.integration.payment.PaymentGatewayClient;
import uz.verifix.jobs.integration.payment.PaymentGatewayRouter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final PricingPlanRepository planRepository;
    private final PaymentRepository paymentRepository;
    private final EmployerRepository employerRepository;
    private final PaymentGatewayRouter gatewayRouter;

    @Transactional(readOnly = true)
    public List<PricingPlan> getAvailablePlans() {
        return planRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PricingPlan getCurrentPlan(UUID employerId) {
        Employer employer = getEmployer(employerId);
        if (employer.getSubscriptionPlan() == null) return null;
        return planRepository.findByCode(employer.getSubscriptionPlan()).orElse(null);
    }

    @Transactional
    public PurchaseResult initiatePurchase(UUID employerId, String planCode, PaymentGateway gateway,
                                            String billingPeriod, String returnUrl) {
        Employer employer = getEmployer(employerId);
        PricingPlan plan = planRepository.findByCode(planCode)
                .orElseThrow(() -> new ResourceNotFoundException("PricingPlan", planCode));

        BigDecimal amount = "ANNUAL".equalsIgnoreCase(billingPeriod)
                ? plan.getPriceAnnualUzs() : plan.getPriceMonthlyUzs();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            // Free plan — just activate
            employer.setSubscriptionPlan(planCode);
            employerRepository.save(employer);
            return new PurchaseResult(null, null, true);
        }

        Payment payment = Payment.builder()
                .employer(employer)
                .plan(plan)
                .amount(amount)
                .gateway(gateway)
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        PaymentGatewayClient client = gatewayRouter.getClient(gateway);
        PaymentGatewayClient.PaymentInitResult result = client.initiatePayment(
                payment.getId().toString(), amount, returnUrl);

        if (!result.success()) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, HttpStatus.BAD_GATEWAY,
                    "Payment initiation failed: " + result.error());
        }

        payment.setExternalId(result.externalId());
        paymentRepository.save(payment);

        log.info("Payment initiated: id={}, gateway={}, amount={}", payment.getId(), gateway, amount);
        return new PurchaseResult(payment.getId(), result.redirectUrl(), true);
    }

    @Transactional
    public void handleCallback(PaymentGateway gateway, Map<String, String> params) {
        PaymentGatewayClient client = gatewayRouter.getClient(gateway);
        PaymentGatewayClient.PaymentCallbackResult result = client.verifyCallback(params);

        if (result.orderId() == null) {
            log.warn("Payment callback with no orderId from {}", gateway);
            return;
        }

        UUID paymentId;
        try {
            paymentId = UUID.fromString(result.orderId());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid payment ID in callback: {}", result.orderId());
            return;
        }

        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found: {}", paymentId);
            return;
        }

        if (result.paid()) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(Instant.now());
            payment.setExternalId(result.externalId());
            paymentRepository.save(payment);

            // Activate subscription
            Employer employer = payment.getEmployer();
            employer.setSubscriptionPlan(payment.getPlan().getCode());
            employerRepository.save(employer);

            log.info("Payment completed: id={}, employer={}, plan={}", paymentId,
                    employer.getId(), payment.getPlan().getCode());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.info("Payment failed: id={}, error={}", paymentId, result.error());
        }
    }

    @Transactional(readOnly = true)
    public Page<Payment> getPaymentHistory(UUID employerId, Pageable pageable) {
        return paymentRepository.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable);
    }

    @Transactional
    public void refundPayment(UUID paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId.toString()));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, HttpStatus.BAD_REQUEST,
                    "Only completed payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Revert employer to FREE plan
        Employer employer = payment.getEmployer();
        employer.setSubscriptionPlan("FREE");
        employerRepository.save(employer);

        log.info("Payment {} refunded. Employer {} reverted to FREE plan. Reason: {}",
                paymentId, employer.getId(), reason);
    }

    private Employer getEmployer(UUID employerId) {
        return employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
    }

    public record PurchaseResult(UUID paymentId, String redirectUrl, boolean success) {}
}
