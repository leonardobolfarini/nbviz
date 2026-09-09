import os

import src.models
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from src.extensions.database import database_uri, db
from src.routes.analytics import analytics_bp
from src.routes.files import files_bp
from src.utils.clean_up import start_cleanup_thread

FILE_TTL_SECONDS = 30 * 60
OUTPUT_FOLDER = "outputs"

app = Flask(__name__)

CORS(app)

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

start_cleanup_thread(OUTPUT_FOLDER, FILE_TTL_SECONDS)

app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(files_bp)
app.register_blueprint(analytics_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5009, debug=True)
