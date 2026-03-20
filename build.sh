#!/bin/bash
# build.sh

echo "Building the project..."
python -m pip install -r requirements.txt

echo "Make migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Collect static files..."
python manage.py collectstatic --noinput --clear

echo "Build completed!"