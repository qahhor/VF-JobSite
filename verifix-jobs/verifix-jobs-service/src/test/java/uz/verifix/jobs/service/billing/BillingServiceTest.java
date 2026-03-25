package uz.verifix.jobs.service.billing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.entity.PricingPlan;
import uz.verifix.jobs.domain.enums.PaymentGateway;
import uz.verifix.jobs.domain.enums.PaymentStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.PaymentRepository;
import uz.verifix.jobs.domain.repository.PricingPlanRepository;
import uz.verifix.jobs.integration.payment.PaymentGatewayRouter;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private PricingPlanRepository planRepository;
    @Mock private EmployerRepository employerRepository;
    @Mock private PaymentGatewayRouter gatewayRouter;
    @InjectMocks private BillingService billingService;

    @Test
    void shouldActivateFreePlanWithoutPayment() {
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        PricingPlan plan = PricingPlan.builder().code("FREE").priceMonthlyUzs(BigDecimal.ZERO).build();

        when(employerRepository.findById(employerId)).thenReturn(Optional.of(employer));
        when(planRepository.findByCode("FREE")).thenReturn(Optional.of(plan));
        when(employerRepository.save(any(Employer.class))).thenAnswer(inv -> inv.getArgument(0));

        Employer result = billingService.activatePlan(employerId, "FREE");

        assertThat(result.getSubscriptionPlan()).isEqualTo("FREE");
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void shouldCreatePaymentForPaidPlan() {
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        PricingPlan plan = PricingPlan.builder().code("PRO").priceMonthlyUzs(BigDecimal.valueOf(500000)).build();

        when(employerRepository.findById(employerId)).thenReturn(Optional.of(employer));
        when(planRepository.findByCode("PRO")).thenReturn(Optional.of(plan));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = billingService.initiatePayment(employerId, "PRO", PaymentGateway.CLICK, "http://return.url");

        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(500000));
        assertThat(result.getStatus()).isEqualTo(PaymentStatus.PENDING);
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void shouldActivatePlanOnSuccessfulPaymentCallback() {
        UUID paymentId = UUID.randomUUID();
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        PricingPlan plan = PricingPlan.builder().code("PRO").build();
        Payment payment = Payment.builder().id(paymentId).employer(employer).pricingPlan(plan).status(PaymentStatus.PENDING).build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employerRepository.save(any(Employer.class))).thenAnswer(inv -> inv.getArgument(0));

        billingService.confirmPayment(paymentId);

        verify(paymentRepository).save(argThat(p -> p.getStatus() == PaymentStatus.PAID));
        verify(employerRepository).save(argThat(e -> "PRO".equals(e.getSubscriptionPlan())));
    }
}
