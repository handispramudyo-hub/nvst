FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    git

RUN docker-php-ext-install \
    pdo_mysql \
    mysqli \
    bcmath \
    intl \
    zip \
    gd \
    opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN addgroup -g 1000 www && adduser -G www -u 1000 -D www

WORKDIR /var/www/html

COPY php.ini /usr/local/etc/php/conf.d/app.ini

EXPOSE 9000
