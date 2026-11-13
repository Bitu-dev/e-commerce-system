package com.minicommerce.product.config;

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

    // 1. Domain Exchanges
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

    // 2. Dead-Letter Queue
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(EventConstants.QUEUE_DEAD_LETTER).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, TopicExchange dlxExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(dlxExchange).with(EventConstants.ROUTING_KEY_DEAD_LETTER);
    }

    // 3. Queue for consuming OrderPlaced events with DLX fallback
    @Bean
    public Queue inventoryOrderPlacedQueue() {
        return QueueBuilder.durable(EventConstants.QUEUE_INVENTORY_ORDER_PLACED)
                .withArgument("x-dead-letter-exchange", EventConstants.EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", EventConstants.ROUTING_KEY_DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding inventoryOrderPlacedBinding(Queue inventoryOrderPlacedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(inventoryOrderPlacedQueue).to(orderExchange).with(EventConstants.ROUTING_KEY_ORDER_PLACED);
    }
}
