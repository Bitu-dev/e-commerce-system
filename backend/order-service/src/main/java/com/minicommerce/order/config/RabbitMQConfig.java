package com.minicommerce.order.config;

import com.minicommerce.events.EventConstants;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTrustedPackages("*");
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EventConstants.EXCHANGE_ORDER);
    }

    @Bean
    public TopicExchange inventoryExchange() {
        return new TopicExchange(EventConstants.EXCHANGE_INVENTORY);
    }

    @Bean
    public TopicExchange dlxExchange() {
        return new TopicExchange(EventConstants.EXCHANGE_DLX);
    }

    // Queue for consuming InventoryReserved and InventoryReservationFailed events
    @Bean
    public Queue orderInventoryResultQueue() {
        return QueueBuilder.durable(EventConstants.QUEUE_ORDER_INVENTORY_RESULT)
                .withArgument("x-dead-letter-exchange", EventConstants.EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", EventConstants.ROUTING_KEY_DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding inventoryReservedBinding(Queue orderInventoryResultQueue, TopicExchange inventoryExchange) {
        return BindingBuilder.bind(orderInventoryResultQueue).to(inventoryExchange).with(EventConstants.ROUTING_KEY_INVENTORY_RESERVED);
    }

    @Bean
    public Binding inventoryFailedBinding(Queue orderInventoryResultQueue, TopicExchange inventoryExchange) {
        return BindingBuilder.bind(orderInventoryResultQueue).to(inventoryExchange).with(EventConstants.ROUTING_KEY_INVENTORY_FAILED);
    }
}
