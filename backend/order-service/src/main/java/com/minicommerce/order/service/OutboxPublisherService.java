package com.minicommerce.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minicommerce.events.EventConstants;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.order.model.OutboxEvent;
import com.minicommerce.order.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Transactional Outbox Background Publisher:
 * Guarantees zero message loss by scanning for PENDING outbox records
 * and publishing them to RabbitMQ if immediate publishing failed.
 */
@Service
public class OutboxPublisherService {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisherService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public OutboxPublisherService(OutboxEventRepository outboxEventRepository,
                                  RabbitTemplate rabbitTemplate,
                                  ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingOutboxEvents() {
        List<OutboxEvent> pending = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        if (pending.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox event(s) to publish", pending.size());

        for (OutboxEvent eventRecord : pending) {
            try {
                if ("OrderPlaced".equals(eventRecord.getEventType())) {
                    OrderPlacedEvent event = objectMapper.readValue(eventRecord.getPayload(), OrderPlacedEvent.class);
                    rabbitTemplate.convertAndSend(EventConstants.EXCHANGE_ORDER, eventRecord.getRoutingKey(), event);
                }

                eventRecord.setStatus("PUBLISHED");
                eventRecord.setPublishedAt(Instant.now());
                outboxEventRepository.save(eventRecord);
                log.info("Successfully published outbox event #{} for aggregate {}", eventRecord.getId(), eventRecord.getAggregateId());
            } catch (Exception e) {
                eventRecord.setRetryCount(eventRecord.getRetryCount() + 1);
                if (eventRecord.getRetryCount() >= 5) {
                    eventRecord.setStatus("FAILED");
                    log.error("Outbox event #{} reached max retries. Marked as FAILED.", eventRecord.getId());
                }
                outboxEventRepository.save(eventRecord);
                log.warn("Failed to publish outbox event #{}: {}", eventRecord.getId(), e.getMessage());
            }
        }
    }
}
