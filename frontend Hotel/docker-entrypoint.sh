#!/bin/bash

# Run migrations and seeds
php artisan migrate --seed --force

# Start Apache
apache2-foreground
