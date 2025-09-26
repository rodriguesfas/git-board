# Dockerfile para Git Board API
FROM php:8.3-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    sqlite3 \
    libsqlite3-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP
RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd

# Habilitar mod_rewrite e mod_headers
RUN a2enmod rewrite headers

# Configurar Apache
COPY api/.htaccess /var/www/html/.htaccess
COPY api/ /var/www/html/

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && mkdir -p /var/www/html/data \
    && chown -R www-data:www-data /var/www/html/data \
    && chmod -R 777 /var/www/html/data

# Expor porta
EXPOSE 80

# Comando padrão
CMD ["apache2-foreground"]
