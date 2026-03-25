package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.request.PurchaseRequest;
import uz.verifix.jobs.api.dto.response.PaymentResponse;
import uz.verifix.jobs.api.dto.response.PricingPlanResponse;
import uz.verifix.jobs.api.dto.response.PurchaseResponse;
import uz.verifix.jobs.api.dto.response.SubscriptionResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.entity.PricingPlan;
import uz.verifix.jobs.service.billing.BillingService;
import uz.verifix.jobs.service.billing.SubscriptionEnforcementService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final BillingService billingService;
    private final SubscriptionEnforcementService enforcementService;

    @GetMapping("/plans")
    public ResponseEntity<List<PricingPlanResponse>> getPlans() {
        List<PricingPlanResponse> plans = billingService.getAvailablePlans().stream()
                .map(this::toPlanResponse)
                .toList();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/current")
    public ResponseEntity<SubscriptionResponse> getCurrent(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        SubscriptionEnforcementService.UsageInfo usage = enforcementService.getUsage(employerId);

        return ResponseEntity.ok(SubscriptionResponse.builder()
                .planCode(usage.planCode())
                .planName(usage.planName())
                .activeVacancies(usage.activeVacancies())
                .maxVacancies(usage.maxVacancies())
                .hasAts(usage.hasAts())
                .hasAnalytics(usage.hasAnalytics())
                .hasApi(usage.hasApi())
                .hasBranding(usage.hasBranding())
                .build());
    }

    @PostMapping("/purchase")
    public ResponseEntity<PurchaseResponse> purchase(
            @Valid @RequestBody PurchaseRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        BillingService.PurchaseResult result = billingService.initiatePurchase(
                employerId,
                request.getPlanCode(),
                request.getGateway(),
                request.getBillingPeriod(),
                request.getReturnUrl()
        );

        return ResponseEntity.ok(PurchaseResponse.builder()
                .paymentId(result.paymentId())
                .redirectUrl(result.redirectUrl())
                .success(result.success())
                .build());
    }

    @GetMapping("/history")
    public ResponseEntity<PageResponse<PaymentResponse>> getHistory(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Page<Payment> page = billingService.getPaymentHistory(employerId, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toPaymentResponse)));
    }

    private PricingPlanResponse toPlanResponse(PricingPlan plan) {
        return PricingPlanResponse.builder()
                .id(plan.getId())
                .code(plan.getCode())
                .name(plan.getName())
                .maxVacancies(plan.getMaxVacancies())
                .maxResumeViews(plan.getMaxResumeViews())
                .hasAts(plan.getHasAts())
                .hasAnalytics(plan.getHasAnalytics())
                .hasApi(plan.getHasApi())
                .hasBranding(plan.getHasBranding())
                .priceMonthlyUzs(plan.getPriceMonthlyUzs())
                .priceAnnualUzs(plan.getPriceAnnualUzs())
                .build();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .planCode(payment.getPlan().getCode())
                .planName(payment.getPlan().getName())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .gateway(payment.getGateway().name())
                .status(payment.getStatus().name())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
