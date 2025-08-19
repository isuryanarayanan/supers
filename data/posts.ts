// Auto-generated posts file
// Version: v20250819-142217
// Generated: 2025-08-19T14:22:18.322Z
// Source: API (http://localhost:3001/dev/posts - dev environment)

import { Post } from "@/types/post";

export const posts: Post[] = [
  {
    "id": "MEILCE2Q09OAFH7ZDC2G",
    "title": "Perimeter: An Egress Traffic Controller",
    "slug": "perimeter-an-egress-traffic-controller",
    "status": "published",
    "featured": false,
    "type": "project",
    "thumbnail": {
      "url": "https://supers-isuryanarayanan-prod.s3.ap-south-1.amazonaws.com/64b32e4e-71fb-4df1-b7db-b48ed604ac23.png",
      "alt": "perimeter logo"
    },
    "excerpt": "Perimeter is a centralized egress traffic controller designed for distributed systems. It ensures that all outgoing API requests from microservices respect the rate limits imposed by external partners.",
    "createdAt": "2025-08-19T13:40:04.034Z",
    "updatedAt": "2025-08-19T14:15:32.214Z",
    "viewCount": 0,
    "cells": [
      {
        "id": "MEIMM0BFY6A31RL043M",
        "type": "markdown",
        "content": "Perimeter is an egress traffic controller built for distributed systems that ensures all outgoing requests adhere to the rate limits of external partners. This article explores the need for such a solution, the architecture behind Perimeter, and how it helps WareIQ monitor and manage outbound API traffic effectively.",
        "order": 1
      },
      {
        "id": "MEIMM0BLJ6NAMLG0T9",
        "type": "markdown",
        "content": "# Understanding WareIQ’s platform and the need for Perimeter\n\nWareIQ is a logistics middleware that seamlessly connects merchants to various sales channels, warehouse management systems and delivery partners. WareIQ platform interacts with various third party systems as mentioned above via APIs, to maintain a single source-of-truth and provide data consistency for our customers as far as the e-commerce order related details are concerned.\n\nCurrently, WareIQ makes over **1.5 million** API requests daily across our partners, and this number is climbing swiftly as we onboard more clients and partners. WareIQ platform is comprised of multiple micro-services. As each micro-service can call same external partner simultaneously for different functionalities, we’ve noticed an increasing number of request failures due to rate limits being hit on these external partners.\n\nThis led us to realize that rate limiting solely at the individual micro-service level is insufficient. We needed a centralized traffic controller that shapes egress traffic being generated across all our micro-services, so that we stay within the bounds of each external partner’s rate limits.\n\nSuppose we have a service that fetches orders from Shopify, which has a rate limit of 2 requests per second. If we have 10 instances of this service running, the combined rate limit would be 20 requests per second in the worst case scenario. However, if all 10 instances are making requests simultaneously, the actual limit we must adhere to is still 2 requests per second. This is where Perimeter comes into play. It ensures that the total rate limit is not exceeded across all instances, maintaining smooth and efficient operations.\n\nBy implementing Perimeter, we centralized rate limiting and are effectively managing our API requests and ensuring we meet the rate limits set by our external partners.",
        "order": 2
      },
      {
        "id": "MEIMM0BZ6YBGJZO6T6K",
        "type": "image",
        "content": "{\"url\":\"https://supers-isuryanarayanan-prod.s3.ap-south-1.amazonaws.com/d5c107dd-e4b7-4497-818e-f188f1719ab8.png\",\"alt\":\"how wareiq communicates\"}",
        "order": 3
      },
      {
        "id": "MEIMM0C4X77JJDEZUV",
        "type": "markdown",
        "content": "# Requirements and research\n\nAddressing the issue of rate limiting at the network level is indeed an efficient solution. However, it presents certain challenges. We could not afford to drop any request that hit rate-limit. If a request is made that exceeds the rate limit, it must be queued and processed soon, ensuring no loss of requests.\n\nIn our research into network layer proxies for rate limiting, we considered Envoy Proxy and Nginx. However, we discovered that both solutions do not meet our requirements. Specifically, both Envoy and Nginx drop requests that exceed the rate limit instead of queuing them for later processing. This behavior does not align with our need to honor all outgoing requests.\n\nAnother requirement was to have a rate limiter where the configured rate limits were dynamic and could be updated on the fly without restarting the service. Also the service should react to the configuration changes in real-time.\n\nNetwork layer solutions for this requirement would require a lot of custom code to be written on top of the existing solutions. This would make the solution complex and difficult to maintain.\n\nSince an application layer best fits these crucial requirements, we decided to build Perimeter as an application layer rate limiter.",
        "order": 4
      },
      {
        "id": "MEIMM0C8Y4HOK2VRWZ",
        "type": "image",
        "content": "{\"url\":\"https://supers-isuryanarayanan-prod.s3.ap-south-1.amazonaws.com/33471a69-f15a-483b-98fa-05216c037c06.png\",\"alt\":\"resource rate limits\"}",
        "order": 5
      },
      {
        "id": "MEIMM0CJZI1D4DG0KZH",
        "type": "image",
        "content": "{\"url\":\"https://supers-isuryanarayanan-prod.s3.ap-south-1.amazonaws.com/a191f7b4-8b6b-4319-b47a-3b7b040b887f.png\",\"alt\":\"How wareiq was restricting themselves\"}",
        "order": 6
      },
      {
        "id": "MEIMM0CO2BGAT4S9W83",
        "type": "markdown",
        "content": "# Understanding Perimeter\nWareIQ uses a microservices architecture and these services are managed in a kubernetes cluster. All key services are written in Python. Perimeter sits between these microservices and the external systems.\n\nSince Perimeter is a critical component, there are 2 questions that we needed to answer before we started building Perimeter:\n\n## How do we ensure that the rate limits are enforced correctly?\nWe implemented a token bucket algorithm to enforce rate limits. The token bucket algorithm is a widely used algorithm for rate limiting. It works by adding tokens to a bucket at a fixed rate. When a request comes in, a token is removed from the bucket. If there are no tokens in the bucket, the request will wait till there is a token available to consume. This ensures that the rate limit is enforced correctly, and the requests are processed in a timely manner.\n\nTokens are added to the bucket based on configurations saved in a postgresql database. This allows us to change the rate limits on the fly without having to restart the service.\n\n## How do we ensure Perimeter is highly available?\nAll our services are in a Kubernetes cluster, and perimeter is deployed as another service in the cluster. Even though having multiple replicas of Perimeter is desirable for high availability, it brings up a new challenge. If we have multiple replicas of Perimeter, how do we ensure that the rate limits are enforced correctly across all these replicas? We decided to park this problem for the future and make the single-replica Perimeter service as robust and fault-tolerant as possible.\n\nPerimeter is a single central service that is deployed as a Kubernetes deployment with a single replica. This ensures that all requests pass through the same instance of Perimeter, and the rate limits are enforced correctly. An instance of perimeter is set to be available at all times, and if it goes down, the Kubernetes deployment ensures that a new instance is spun up immediately.\n\nAdditionally, as a fallback, we have updated all our services to have a retry mechanism in case of a rate limit error. This ensures that even if Perimeter goes down, the services will continue to function, albeit with a higher failure rate.\n\nSince it is going to be a single instance, the service itself needed to be fast and lightweight. We chose to write Perimeter in Golang, as it is known for its speed and efficiency in handling concurrent requests.",
        "order": 7
      },
      {
        "id": "MEIMM0D3N69DION1V4E",
        "type": "markdown",
        "content": "# Components of Perimeter\nPerimeter has four main components:\n\n**Configurations**: Rate limits are saved in a PostgreSQL database. Perimeter reads these configurations and creates Beats for each configuration. A Beat is a goroutine that adds tokens to the bucket at a fixed rate. These configurations are updated periodically, and Beats are created, updated, or destroyed based on the configurations.\n\n**Beats**: Each Beat is responsible for adding tokens to the bucket at a fixed rate. When a request comes in, the Beat checks if there are enough tokens in the bucket to process the request. If there are enough tokens, the request is processed, and a token is removed from the bucket. If there are not enough tokens, the request is queued and processed as soon as there are enough tokens in the bucket.\n\n**Structured Logging**: Perimeter logs all the requests that come in and the rate limits that are enforced. This allows us to monitor the traffic and ensure the rate limits are enforced correctly.\n\n**Alerts**: We have set up alerts for various metrics to notify us when thresholds are exceeded, enabling us to respond swiftly and maintain system performance.\n\nPerimeter utilizes the blocking behavior of Go channels to queue requests when the rate limit is exceeded. This ensures that no requests are dropped and all requests are processed as soon as the rate limit allows.",
        "order": 8
      },
      {
        "id": "MEIMM0D81GV9TU0RVJC",
        "type": "image",
        "content": "{\"url\":\"https://supers-isuryanarayanan-prod.s3.ap-south-1.amazonaws.com/86c58391-ca8e-430c-befa-fe8ae0788e01.png\",\"alt\":\"perimeter token bucket\"}",
        "order": 9
      },
      {
        "id": "MEIMM0DCNVGIATW92J",
        "type": "markdown",
        "content": "# Testing Perimeter’s Performance and Reliability\n\nTo ensure Perimeter can handle the requirements of our system, we conducted a variety of tests to evaluate its performance and reliability. We built our own load simulator using a simple Python script that sends requests to Perimeter at a configurable rate or load. Additionally, we incorporated our own custom services, each with different rate limits, to test Perimeter’s flexibility and enforcement capabilities. We spun up different docker containers corresponding to some of our micro-services and triggers, enabling us to simulate various network conditions and configurations. This comprehensive testing approach ensured that Perimeter could handle the load and enforce rate limits correctly across diverse scenarios.",
        "order": 10
      },
      {
        "id": "MEIMM0DSB8EQIRKGCAD",
        "type": "markdown",
        "content": "# Perimeter in Action\n\nPerimeter enhances the consistency of egress traffic and is now utilized to monitor and manage outgoing API traffic at WareIQ. Perimeter has enabled us to identify and resolve several previously undetected external API related issues within our system. We have established alerts for different metrics, helping us respond to issues quickly.",
        "order": 11
      },
      {
        "id": "MEIMM0E7N266QNIKPG",
        "type": "markdown",
        "content": "# Future Work\n1. **Rate Limiting Types**: Currently, Perimeter only supports rate limiting based on the number of requests per rate period. We are working on adding more rate limiting types, such as API-level rate limiting and service-level rate limiting.\n2. **Request Analytics**: We are adding request analytics to Perimeter. This will allow us to monitor traffic and identify patterns, helping us detect anomalies and respond quickly.\n3. **Enhanced Alerting**: We are improving our alerting capabilities. This will allow us to set up alerts for different metrics and get notified when thresholds are crossed, ensuring proactive issue resolution.",
        "order": 12
      },
      {
        "id": "MEIMM0ECIO5BS2HW93A",
        "type": "markdown",
        "content": "# Conclusion\n\nPerimeter is a critical component in ensuring that WareIQ’s egress traffic adheres to the rate limits of external partners, enhancing system reliability and performance. By implementing Perimeter, we have centralized rate limiting, effectively managed our API requests, and ensured compliance with external rate limits. As we continue to develop Perimeter, we are focused on adding new features and improving existing capabilities to meet our growing needs.",
        "order": 13
      }
    ]
  }
];

export const postsMetadata = {
  version: "v20250819-142217",
  generatedAt: "2025-08-19T14:22:18.322Z",
  source: "api",
  environment: "dev",
  count: 1
};
