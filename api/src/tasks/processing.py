import logging
import os
import shutil
from uuid import UUID

from main import app
from src.extensions.database import db
from src.models.users import Analyses
from src.utils.constants import (
    HEADER_SCOPUS,
    HEADER_WOS,
    OPENALEX_TO_SCOPUS,
    OUTPUT_FOLDER,
    WOS_TO_SCOPUS,
)

import nbviz_scientometric_tools as st

logger = logging.getLogger(__name__)


def process_analysis(
    analysis_id: str,
    scopus_path: str | None,
    wos_path: str | None,
    openalex_search: str | None,
    output_format: str,
    limit: int | None,
    input_folder: str,
) -> None:
    with app.app_context():
        analysis = db.session.get(Analyses, UUID(analysis_id))
        if analysis is None:
            logger.warning("Queued analysis %s no longer exists", analysis_id)
            return

        analysis.status = "processing"
        db.session.commit()

        try:
            dfs_to_concat = []

            if scopus_path:
                with open(scopus_path, "rb") as scopus_file:
                    scopus_df = st.read_scopus_file(scopus_file.read())
                scopus_df = st.keep_columns(scopus_df, HEADER_SCOPUS)
                dfs_to_concat.append(st.process_scopus_data(scopus_df, HEADER_SCOPUS))

            if wos_path:
                with open(wos_path, "rb") as wos_file:
                    wos_df = st.read_wos_file(wos_file)
                wos_df = st.keep_columns(wos_df, HEADER_WOS)
                wos_df = st.process_wos_data(wos_df, HEADER_WOS)
                dfs_to_concat.append(wos_df.rename(WOS_TO_SCOPUS))

            if openalex_search:
                openalex_df = st.fetch_openalex_works(
                    openalex_search,
                    os.getenv("OPENALEX_API_KEY"),
                    limit=limit,
                )
                dfs_to_concat.append(openalex_df.rename(OPENALEX_TO_SCOPUS))

            if len(dfs_to_concat) <= 1:
                raise ValueError("At least two data sources are required for a merge.")

            if output_format in {"scopus", "openalex"}:
                configs = {
                    "separator": ",",
                    "quote_char": '"',
                    "quote_style": "always",
                }
                extension = "csv"
            elif output_format == "wos":
                configs = {"separator": "\t"}
                extension = "txt"
            else:
                raise ValueError("Unsupported output format.")

            merged_data, removed_merged_data, venn_df = st.merge_and_process(
                dfs_to_concat,
                ["Title", "Year"],
            )

            os.makedirs(OUTPUT_FOLDER, exist_ok=True)
            output_name = f"all_in_one_{analysis.id}.{extension}"
            removed_name = f"removed_{analysis.id}.{extension}"
            merged_data.write_csv(os.path.join(OUTPUT_FOLDER, output_name), **configs)
            removed_merged_data.write_csv(
                os.path.join(OUTPUT_FOLDER, removed_name), **configs
            )

            analysis.download_url = f"/download/{output_name}"
            analysis.removed_url = f"/download/{removed_name}"
            analysis.venn = venn_df.to_dicts()
            analysis.status = "finished"
            db.session.commit()
        except Exception:
            db.session.rollback()
            failed_analysis = db.session.get(Analyses, UUID(analysis_id))
            if failed_analysis is not None:
                failed_analysis.status = "error"
                db.session.commit()
            logger.exception("Processing failed for analysis %s", analysis_id)
            raise
        finally:
            shutil.rmtree(input_folder, ignore_errors=True)
