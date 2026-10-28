import hashlib
import secrets
import smtplib
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage

from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from pandas.io.stata import os
from sqlalchemy.exc import IntegrityError, NoResultFound
from src.extensions.database import db
from src.models.users import Users
from werkzeug.security import check_password_hash, generate_password_hash

users_bp = Blueprint("users", __name__)


@users_bp.route("/users/me", methods=["GET"])
@jwt_required()
def get_current_user():
    email = get_jwt_identity()

    try:
        user = db.session.scalars(db.select(Users).where(Users.email == email)).one()

        return jsonify(user.to_dict())

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


@users_bp.route("/users/recover", methods=["POST"])
def recover():
    data = request.get_json()
    email = data.get("email")

    user = db.session.scalars(
        db.select(Users).where(Users.email == email)
    ).one_or_none()

    if user:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        user.password_reset_token_hash = token_hash
        user.password_reset_expires_at = datetime.now(UTC) + timedelta(minutes=30)

        db.session.commit()

        system_email = os.getenv("EMAIL")
        system_password = os.getenv("EMAIL_PASSWORD")

        if not system_email or not system_password:
            return make_response(
                jsonify({"error": "system_email and system_password are required"}), 500
            )

        msg = EmailMessage()
        msg["Subject"] = "Redefinição de senha — NBVIZ"
        msg["From"] = system_email
        msg["To"] = email
        body = f"""
        Olá,

        Recebemos uma solicitação para redefinir a senha da sua conta no NBVIZ.

        Para criar uma nova senha, acesse o link abaixo dentro de 30 minutos:

        {f"{os.getenv('FRONTEND_URL')}/redefinir-senha?token={token}"}

        Se você não solicitou essa alteração, ignore este e-mail. Sua senha continuará a mesma.

        Atenciosamente,
        Equipe NBVIZ
        """
        msg.set_content(body)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(system_email, system_password)
            server.send_message(msg)

    return jsonify(
        {"message": "if account exists, we will send an recuperation email to it"}
    ), 200


@users_bp.route("/users/change_password", methods=["PATCH"])
def change_password():
    data = request.get_json()

    token = data.get("token")
    password = data.get("password")

    if not token or not password:
        return make_response(jsonify({"error": "token and password are required"}), 400)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    user = db.session.scalars(
        db.select(Users).where(Users.password_reset_token_hash == token_hash)
    ).one_or_none()

    if (
        not user
        or not user.password_reset_expires_at
        or user.password_reset_expires_at <= datetime.now(UTC)
    ):
        return make_response(jsonify({"error": "token is invalid or expired"}), 403)

    user.password_hash = generate_password_hash(password)

    user.password_reset_token_hash = None
    user.password_reset_expires_at = None

    db.session.commit()

    return make_response(jsonify({"message": "password changed successfully"}), 200)
