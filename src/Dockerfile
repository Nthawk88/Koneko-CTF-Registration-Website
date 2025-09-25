# PHP Apache with PDO_PGSQL
FROM php:8.2-apache

# Avoid interactive prompts during apt operations
ARG DEBIAN_FRONTEND=noninteractive

# Install PostgreSQL extensions and dependencies (with retries)
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.debian.org/debian|g' /etc/apt/sources.list \
    && apt-get update -o Acquire::Retries=3 \
    && apt-get install -y --no-install-recommends ca-certificates wget git libpq-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql
    # && rm -rf /var/lib/apt/lists/*

# Enable Apache modules commonly needed
RUN a2enmod rewrite headers expires

# Copy source code
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Ownership for Apache user
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
