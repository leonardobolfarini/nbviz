import os
import time
import threading
from datetime import datetime, timezone

from src.extensions.database import db
from src.models.users import Analyses


def remove_analysis_file(output_folder, url):
    if not url:
        return

    file_name = os.path.basename(url)
    path = os.path.join(output_folder, file_name)

    try:
        if os.path.isfile(path):
            os.remove(path)
    except FileNotFoundError:
        pass


def delete_expired_analyses(app, output_folder):
    with app.app_context():
        expired_analyses = db.session.scalars(
            db.select(Analyses).where(
                Analyses.expires_at <= datetime.now(timezone.utc)
            )
        ).all()

        try:
            for analysis in expired_analyses:
                remove_analysis_file(output_folder, analysis.download_url)
                remove_analysis_file(output_folder, analysis.removed_url)
                db.session.delete(analysis)

            db.session.commit()
        except Exception:
            db.session.rollback()
            raise


def start_cleanup_thread(app, output_folder, ttl_seconds):
    def cleanup_old_files():
        while True:
            try:
                delete_expired_analyses(app, output_folder)

                now = time.time()
                if os.path.exists(output_folder):
                    for fname in os.listdir(output_folder):
                        fpath = os.path.join(output_folder, fname)
                        try:
                            if os.path.isfile(fpath):
                                age = now - os.path.getmtime(fpath)
                                if age > ttl_seconds:
                                    os.remove(fpath)
                        except FileNotFoundError:
                            pass
            except Exception:
                app.logger.exception("Could not clean expired analyses")
            time.sleep(300)

    thread = threading.Thread(target=cleanup_old_files, daemon=True)
    thread.start()
