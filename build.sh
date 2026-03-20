#!/bin/bash

echo "🚀 Начинаем сборку проекта..."

# Обновляем pip
echo "📦 Обновляем pip..."
pip install --upgrade pip

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
pip install -r requirements.txt

# Проверяем установку Django
echo "🔍 Проверяем установку Django..."
python -c "import django; print(f'✅ Django {django.get_version()} установлен')"

# Применяем миграции
echo "🔄 Применяем миграции..."
python manage.py migrate --noinput

# Собираем статику
echo "📁 Собираем статические файлы..."
python manage.py collectstatic --noinput --clear

echo "✅ Сборка завершена!"
