package uz.verifix.jobs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publish(String type, UUID entityId, String entityType, UUID actorId, Map<String, Object> payload) {
        DomainEvent event = DomainEvent.builder()
                .type(type)
                .entityId(entityId)
                .entityType(entityType)
                .actorId(actorId)
                .payload(payload)
                .build();

        eventPublisher.publishEvent(event);
        log.debug("Domain event published: {} for {}:{}", type, entityType, entityId);
    }

    public void publish(String type, UUID entityId, String entityType) {
        publish(type, entityId, entityType, null, Map.of());
    }
}
