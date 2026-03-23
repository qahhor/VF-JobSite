package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.PurchaseRequest;
import uz.verifix.jobs.api.dto.response.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.entity.PricingPlan;
import uz.verifix.jobs.domain.repository.ManagerRepository;
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
    private final ManagerRepository managerRepository;

    @GetMapping("/plans")
    public ResponseEntity<List<PricingPlanResponse>> getPlans() {
        List<PricingPlanResponse> plans = billingService.getAvailablePlans().stream()
                .map(this::toPlanResponse)
                .toList();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/current")
    public ResponseEntity<SubscriptionResponse> getCurrent(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
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

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        BillingService.PurchaseResult result = billingService.initiatePurchase(
                employerId, request.getPlanCode(), request.getGateway(),
                request.getBillingPeriod(), request.getReturnUrl());

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

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Page<Payment> page = billingService.getPaymentHistory(employerId, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toPaymentResponse)));
    }

    private PricingPlanResponse toPlanResponse(PricingPlan p) {
        return PricingPlanResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .maxVacancies(p.getMaxVacancies())
                .maxResumeViews(p.getMaxResumeViews())
                .hasAts(p.getHasAts())
                .hasAnalytics(p.getHasAnalytics())
                .hasApi(p.getHasApi())
                .hasBranding(p.getHasBranding())
                .priceMonthlyUzs(p.getPriceMonthlyUzs())
                .priceAnnualUzs(p.getPriceAnnualUzs())
                .build();
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .planCode(p.getPlan().getCode())
                .planName(p.getPlan().getName())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .gateway(p.getGateway().name())
                .status(p.getStatus().name())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
