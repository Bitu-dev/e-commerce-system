package com.minicommerce.notification.config;

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
    public TopicExchange dlxExchange() {
        return new TopicExchange(EventConstants.EXCHANGE_DLX);
    }

    // Queue for consuming Order lifecycle events (Placed, Confirmed, Rejected)
    @Bean
    public Queue notificationOrderEventsQueue() {
        return QueueBuilder.durable(EventConstants.QUEUE_NOTIFICATION_ORDER_EVENTS)
                .withArgument("x-dead-letter-exchange", EventConstants.EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", EventConstants.ROUTING_KEY_DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding orderPlacedBinding(Queue notificationOrderEventsQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationOrderEventsQueue).to(orderExchange).with(EventConstants.ROUTING_KEY_ORDER_PLACED);
    }

    @Bean
    public Binding orderConfirmedBinding(Queue notificationOrderEventsQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationOrderEventsQueue).to(orderExchange).with(EventConstants.ROUTING_KEY_ORDER_CONFIRMED);
    }

    @Bean
    public Binding orderRejectedBinding(Queue notificationOrderEventsQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationOrderEventsQueue).to(orderExchange).with(EventConstants.ROUTING_KEY_ORDER_REJECTED);
    }
}
