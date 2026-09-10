from flask import Blueprint, jsonify, request
from src.extensions.database import db
from src.models.users import Users
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/users", methods=["GET"])
def get_users():
    users = db.session.execute(db.select(Users).order_by(Users.email)).scalars().all()

    users_data = [user.to_dict() for user in users]

    return jsonify(users_data)


@auth_bp.route("/users/create", methods=["POST"])
def user_create():
    email = request.form.get("email")
    password = request.form.get("password")

    if not email or not password:
        return jsonify({"message": "email and password are required."}, 400)

    password_hash = generate_password_hash(password)

    user = Users(email=email, password_hash=password_hash)

    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Usuário criado com sucesso"}, 200)
