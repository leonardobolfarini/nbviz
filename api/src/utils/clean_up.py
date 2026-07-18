import os
import time
import threading

def start_cleanup_thread(output_folder, ttl_seconds):
    def cleanup_old_files():
        while True:
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
            time.sleep(300)

    thread = threading.Thread(target=cleanup_old_files, daemon=True)
    thread.start()
