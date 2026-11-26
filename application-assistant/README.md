# Application Assistant Prototype

Flask/SQLAlchemy prototype with registration/login, stored text-statistics feedback and an illustrative two-feature classifier.

```bash
python -m pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```

Run locally at `http://127.0.0.1:5000`. Use synthetic text only when exploring. The recovered fallback classifier trains on three invented GPA/test-score records. Its labels are explicitly synthetic and must not be interpreted as university recommendations, admission chances or decisions. Counting past participles does not reliably identify passive voice.

Missing trained weights, real evaluation data, CSRF protection and deployment hardening limit the prototype. Do not load untrusted joblib/pickle files. The three-record fallback and the spaCy feedback route were exercised with local fixtures.
