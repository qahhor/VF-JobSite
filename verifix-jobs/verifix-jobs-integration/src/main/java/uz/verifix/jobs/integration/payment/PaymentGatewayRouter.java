package uz.verifix.jobs.integration.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.enums.PaymentGateway;

@Component
@RequiredArgsConstructor
public class PaymentGatewayRouter {

    private final ClickUzClient clickUzClient;
    private final PaymeClient paymeClient;

    public PaymentGatewayClient getClient(PaymentGateway gateway) {
        return switch (gateway) {
            case CLICK -> clickUzClient;
            case PAYME -> paymeClient;
        };
    }
}
