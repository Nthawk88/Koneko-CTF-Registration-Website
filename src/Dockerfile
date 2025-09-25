# PHP Apache with PDO_PGSQL
FROM php:8.2-apache-bullseye

# Avoid interactive prompts during apt operations
ARG DEBIAN_FRONTEND=noninteractive

# Install PostgreSQL extensions and dependencies (with retries)
RUN set -eux; \
    apt-get update -o Acquire::Retries=3; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        wget \
        git \
        libpq-dev; \
    docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql; \
    rm -rf /var/lib/apt/lists/*

# Enable Apache modules commonly needed
RUN a2enmod rewrite headers expires

# Set working directory
WORKDIR /var/www/html

# Copy source code
COPY . .

# Ownership for Apache user
RUN chown -R www-data:www-data /var/www/html

# Switch to Apache user (optional, safer)
USER www-data

# Expose HTTP port
EXPOSE 80
