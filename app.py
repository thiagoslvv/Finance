import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Check if we should use PostgreSQL (production) or SQLite (development/local)
DATABASE_URL = os.environ.get('DATABASE_URL')
IS_POSTGRES = DATABASE_URL is not None

if IS_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')

def get_db_connection():
    if IS_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    else:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        return conn

def get_db_cursor(conn):
    if IS_POSTGRES:
        return conn.cursor(cursor_factory=RealDictCursor)
    else:
        return conn.cursor()

def execute_query(cursor, query, params=()):
    if IS_POSTGRES:
        query = query.replace('?', '%s')
    cursor.execute(query, params)

def init_db():
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    if IS_POSTGRES:
        execute_query(cursor, '''
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                value DOUBLE PRECISION NOT NULL,
                category VARCHAR(100) NOT NULL,
                date VARCHAR(50) NOT NULL
            )
        ''')
    else:
        execute_query(cursor, '''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                value REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL
            )
        ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

# API Endpoints
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    execute_query(cursor, 'SELECT * FROM expenses ORDER BY date DESC, id DESC')
    rows = cursor.fetchall()
    conn.close()
    
    expenses = []
    for row in rows:
        expenses.append({
            'id': row['id'],
            'name': row['name'],
            'value': row['value'],
            'category': row['category'],
            'date': row['date']
        })
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    name = data.get('name')
    value = data.get('value')
    category = data.get('category')
    date = data.get('date')

    if not name or value is None or not category or not date:
        return jsonify({'error': 'Todos os campos são obrigatórios!'}), 400

    try:
        value = float(value)
    except ValueError:
        return jsonify({'error': 'O valor deve ser um número válido!'}), 400

    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    if IS_POSTGRES:
        execute_query(
            cursor,
            'INSERT INTO expenses (name, value, category, date) VALUES (?, ?, ?, ?) RETURNING id',
            (name, value, category, date)
        )
        new_id = cursor.fetchone()['id']
    else:
        execute_query(
            cursor,
            'INSERT INTO expenses (name, value, category, date) VALUES (?, ?, ?, ?)',
            (name, value, category, date)
        )
        new_id = cursor.lastrowid
        
    conn.commit()
    conn.close()

    return jsonify({
        'id': new_id,
        'name': name,
        'value': value,
        'category': category,
        'date': date
    }), 201

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    data = request.get_json()
    name = data.get('name')
    value = data.get('value')
    category = data.get('category')
    date = data.get('date')

    if not name or value is None or not category or not date:
        return jsonify({'error': 'Todos os campos são obrigatórios!'}), 400

    try:
        value = float(value)
    except ValueError:
        return jsonify({'error': 'O valor deve ser um número válido!'}), 400

    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    # Check if expense exists
    execute_query(cursor, 'SELECT id FROM expenses WHERE id = ?', (expense_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Despesa não encontrada!'}), 404

    execute_query(
        cursor,
        'UPDATE expenses SET name = ?, value = ?, category = ?, date = ? WHERE id = ?',
        (name, value, category, date, expense_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        'id': expense_id,
        'name': name,
        'value': value,
        'category': category,
        'date': date
    })

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    # Check if expense exists
    execute_query(cursor, 'SELECT id FROM expenses WHERE id = ?', (expense_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Despesa não encontrada!'}), 404

    execute_query(cursor, 'DELETE FROM expenses WHERE id = ?', (expense_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Despesa excluída com sucesso!', 'id': expense_id})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
