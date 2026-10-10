from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError, NoResultFound
from src.extensions.database import db
from src.models.users import Users
from werkzeug.security import check_password_hash, generate_password_hash

users_bp = Blueprint("users", __name__)


@users_bp.route("/users", methods=["GET"])
def get_users():
    users = db.session.execute(db.select(Users).order_by(Users.email)).scalars().all()

    users_data = [user.to_dict() for user in users]

    return jsonify(users_data)


@users_bp.route("/users/me", methods=["GET"])
@jwt_required()
def get_current_user():
    email = get_jwt_identity()

    try:
        user = db.session.scalars(db.select(Users).where(Users.email == email)).one()

        return jsonify({"id": str(user.id), "email": str(user.email)})

    except NoResultFound:
        return make_response(jsonify({"message": "user not found"}), 404)


@users_bp.route("/users/create", methods=["POST"])
def user_create():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return make_response(
            jsonify({"message": "email and password are required."}), 400
        )

    password_hash = generate_password_hash(password)

    user = Users(email=email, password_hash=password_hash)

    try:
        db.session.add(user)
        db.session.commit()

        user = db.session.scalars(db.select(Users).where(Users.email == email)).one()

        password_is_correct = check_password_hash(user.password_hash, password)

        if not password_is_correct:
            return make_response(jsonify({"error": "invalid credentials."}), 401)

        access_token = create_access_token(identity=email)

        return jsonify(access_token=access_token)
    except IntegrityError:
        db.session.rollback()
        return make_response(jsonify({"message": "email already in use"}), 409)

    return make_response(jsonify({"message": "user created successfully"}), 200)


@users_bp.route("/users/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return make_response(
            jsonify({"error": "email and password are required."}), 400
        )

    try:
        user = db.session.scalars(db.select(Users).where(Users.email == email)).one()

        password_is_correct = check_password_hash(user.password_hash, password)

        if not password_is_correct:
            return make_response(jsonify({"error": "invalid credentials."}), 401)

        access_token = create_access_token(identity=email)

        return jsonify(access_token=access_token)

    except NoResultFound:
        return make_response(jsonify({"error": "invalid credentials"}), 401)


@users_bp.route("/users/delete", methods=["DELETE"])
@jwt_required()
def delete():
    email = get_jwt_identity()

    user = db.session.scalars(db.select(Users).where(Users.email == email)).one()
    db.session.delete(user)
    db.session.commit()

    return make_response(jsonify({"message": "account deleted successfully"}), 200)
