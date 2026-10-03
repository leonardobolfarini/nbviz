import os

import src.models
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from src.extensions.database import database_uri, db
from src.routes.analytics import analytics_bp
from src.routes.files import files_bp
from src.routes.users import users_bp
from src.utils.clean_up import start_cleanup_thread
from src.utils.constants import OUTPUT_FOLDER

FILE_TTL_SECONDS = 3 * 60 * 60

app = Flask(__name__)
load_dotenv()

CORS(app)

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

if os.getenv("START_FILE_CLEANUP", "true").lower() == "true":
    start_cleanup_thread(OUTPUT_FOLDER, FILE_TTL_SECONDS)

app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_KEY")

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(files_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(users_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5009, debug=True)
