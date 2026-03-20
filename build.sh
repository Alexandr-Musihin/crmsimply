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

# Проверяем наличие переменных окружения
echo "🔍 Проверяем переменные окружения..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL не установлен, используем SQLite"
    export DATABASE_URL="sqlite:///db.sqlite3"
else
    echo "✅ DATABASE_URL установлен"
fi

# Создаем папку для медиа файлов
echo "📁 Создаем папки для файлов..."
mkdir -p media staticfiles

# Проверяем наличие миграций
echo "📝 Проверяем миграции..."
if [ ! -d "crm/migrations" ]; then
    echo "📁 Создаем папку для миграций..."
    mkdir -p crm/migrations
    touch crm/migrations/__init__.py
fi

# Создаем миграции
echo "🔄 Создаем новые миграции..."
python manage.py makemigrations --noinput

# Применяем миграции
echo "🔄 Применяем миграции..."
python manage.py migrate --noinput

# Проверяем, созданы ли таблицы
echo "🔍 Проверяем создание таблиц..."
python -c "
import sqlite3
import os
import sys

try:
    # Пробуем подключиться к базе
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table' AND name='crm_contact'\")
        if cursor.fetchone():
            print('✅ Таблица crm_contact существует')
        else:
            print('❌ Таблица crm_contact не найдена')
            sys.exit(1)
except Exception as e:
    print(f'❌ Ошибка проверки таблиц: {e}')
    sys.exit(1)
"

# Проверяем, есть ли пользователи
echo "👤 Проверяем наличие пользователей..."
python -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if User.objects.count() == 0:
    print('⚠️  Нет пользователей. Создайте суперпользователя вручную:')
    print('   python manage.py createsuperuser')
else:
    print(f'✅ Найдено {User.objects.count()} пользователей')
"

# Собираем статику
echo "📁 Собираем статические файлы..."
python manage.py collectstatic --noinput --clear

# Проверяем собранную статику
echo "🔍 Проверяем статические файлы..."
if [ -d "staticfiles" ]; then
    STATIC_COUNT=$(find staticfiles -type f | wc -l)
    echo "✅ Собрано $STATIC_COUNT статических файлов"
else
    echo "⚠️  Папка staticfiles не создана"
fi

# Выводим информацию о версиях
echo "📊 Информация о версиях:"
python --version
pip list | grep -E "Django|gunicorn|psycopg2"

echo "✅ Сборка завершена успешно!"

# Проверка миграций (дополнительная)
echo "🔄 Проверяем состояние миграций..."
python manage.py showmigrations
