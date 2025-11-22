FROM php:8.2-apache-bullseye

ARG DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
    apt-get update -o Acquire::Retries=3; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        wget \
        git \
        libpq-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libwebp-dev \
        libxpm-dev; \
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-xpm; \
    docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql gd; \
    rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite headers expires

WORKDIR /var/www/html

COPY . .

RUN chown -R www-data:www-data /var/www/html

USER www-data

EXPOSE 80
