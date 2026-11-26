from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from sqlalchemy.exc import IntegrityError
import re
import math
import joblib
import spacy
import pandas as pd
import numpy as np

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or os.urandom(32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///applicant.db'
db = SQLAlchemy(app)

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Load ML model (fallback to mock)
try:
    ml_model = joblib.load("recommender.pkl")
except FileNotFoundError:
    from sklearn.linear_model import LogisticRegression
    ml_model = LogisticRegression()
    X_dummy = np.array([[3.0, 1400], [3.5, 1500], [4.0, 1600]])
    y_dummy = [0, 1, 1]
    ml_model.fit(X_dummy, y_dummy)


# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))

class Essay(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text)
    feedback = db.Column(db.Text)

# --- Routes ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        supplied = request.form.get('password', '')
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(email) > 100 or not supplied:
            return render_template('register.html', error='Enter a valid email and a password.'), 400
        password = generate_password_hash(supplied)
        new_user = User(email=email, password=password)
        db.session.add(new_user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return render_template('register.html', error='An account already uses this email.'), 409
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter(db.func.lower(User.email) == request.form.get('email', '').strip().lower()).first()
        if user and check_password_hash(user.password, request.form.get('password', '')):
            session['user_id'] = user.id
            return redirect(url_for('dashboard'))
        flash("Invalid login")
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/essay', methods=['GET', 'POST'])
def essay():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    feedback = ""
    if request.method == 'POST':
        text = request.form.get('essay', '').strip()
        if not text or len(text) > 20000:
            return render_template('essay.html', feedback='Enter between 1 and 20,000 characters.'), 400
        doc = nlp(text)
        feedback += f"Total words: {len(doc)}\n"
        feedback += f"Sentences: {len(list(doc.sents))}\n"
        passive = [sent.text for sent in doc.sents if any(tok.tag_ == 'VBN' for tok in sent)]
        feedback += f"Sentences containing a past participle (heuristic only): {len(passive)}\n"
        db.session.add(Essay(user_id=session['user_id'], content=text, feedback=feedback))
        db.session.commit()
    return render_template('essay.html', feedback=feedback)

@app.route('/recommend', methods=['GET', 'POST'])
def recommend():
    result = None
    if request.method == 'POST':
        try:
            gpa = float(request.form.get('gpa', ''))
            sat = int(request.form.get('sat', ''))
            if not math.isfinite(gpa) or not 0 <= gpa <= 4 or not 400 <= sat <= 1600:
                raise ValueError
        except ValueError:
            return render_template('recommend.html', error='Enter a GPA from 0 to 4 and an SAT score from 400 to 1600.'), 400
        prediction = ml_model.predict([[gpa, sat]])
        result = "Synthetic demonstration label 1" if prediction[0] else "Synthetic demonstration label 0"
    return render_template('recommend.html', result=result)

# --- Run ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', debug=False)
