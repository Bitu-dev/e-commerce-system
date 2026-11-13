import MiniCommerceApp from '@/components/minicommerce-app'

export default function Page() {
  return <MiniCommerceApp />
}

export const dynamic = 'force-static'

export function generateMetadata() {
  return {
    title: 'Aurora Hardware — Event-Driven Order & Inventory Platform',
    description:
      'High-performance asynchronous e-commerce platform built with Spring Boot, RabbitMQ, PostgreSQL, Redis, and Keycloak PKCE.',
  }
}

export { MiniCommerceApp }
