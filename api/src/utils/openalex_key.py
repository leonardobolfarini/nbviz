import os

from cryptography.fernet import Fernet


def _cipher() -> Fernet:
    key = os.environ.get("OPENALEX_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("OPENALEX_ENCRYPTION_KEY is not configured")
    return Fernet(key.encode("ascii"))


def encrypt_openalex_key(key: str) -> str:
    return _cipher().encrypt(key.encode("utf-8")).decode("ascii")


def decrypt_openalex_key(token: str) -> str:
    return _cipher().decrypt(token.encode("ascii")).decode("utf-8")
