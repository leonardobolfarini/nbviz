import importlib
import sys
import types
import tempfile
import unittest
from pathlib import Path
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4

import polars as pl
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from nbviz_scientometric_tools.tesauro import authors_standardization, read_tesauro
from src.routes.files import files_bp


class StandardizeAuthorsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fake_main = types.ModuleType('main')
        fake_main.app = Flask(__name__)
        with patch.dict(sys.modules, {'main': fake_main}):
            cls.processing = importlib.import_module('src.tasks.processing')

    def setUp(self):
        app = Flask(__name__)
        app.config['JWT_SECRET_KEY'] = 'test-secret-which-is-at-least-32-bytes-long'
        JWTManager(app)
        app.register_blueprint(files_bp)
        self.client = app.test_client()
        with app.app_context():
            self.headers = {'Authorization': 'Bearer ' + create_access_token(identity='test@example.com')}
        self.thesaurus = 'Nome a manter | Nomes substituídos\nFinal | [Antigo; Outro]\n'.encode()

    def test_login_required(self):
        self.assertEqual(self.client.post('/standardize_authors').status_code, 401)

    def test_submission_failure_is_logged(self):
        with patch('src.routes.files.db') as db, patch('src.routes.files.st.read_tesauro', side_effect=RuntimeError('library failure')):
            db.session.scalars.return_value.one.return_value = SimpleNamespace(id=uuid4())
            with self.assertLogs(level='ERROR') as logs:
                response = self.client.post('/standardize_authors', headers=self.headers, data={
                    'file': (BytesIO(b'Authors\nAntigo\n'), 'dados.csv'),
                    'thesaurusFile': (BytesIO(self.thesaurus), 'tesauro.txt'),
                    'databaseType': 'scopus',
                })
            self.assertEqual(response.status_code, 500)
            self.assertIn('library failure', '\n'.join(logs.output))

    def test_submit_to_queue(self):
        with tempfile.TemporaryDirectory() as folder, patch('src.routes.files.INPUT_FOLDER', folder), patch('src.routes.files.db') as db, patch('src.routes.files.processing_queue') as queue, patch('src.routes.files.Analyses') as analysis_cls:
            db.session.scalars.return_value.one.return_value = SimpleNamespace(id=uuid4())
            analysis = SimpleNamespace(id=uuid4(), status='pending')
            analysis_cls.return_value = analysis
            queue.enqueue.return_value.id = 'job-id'
            response = self.client.post('/standardize_authors', headers=self.headers, data={
                'file': (BytesIO(b'Authors,Title\nAntigo,Teste\n'), 'dados.csv'),
                'thesaurusFile': (BytesIO(self.thesaurus), 'tesauro.txt'),
                'databaseType': 'scopus',
            })
            self.assertEqual(response.status_code, 202)
            self.assertEqual(response.json['job_id'], 'job-id')
            args = queue.enqueue.call_args.args
            self.assertEqual(args[0], 'src.tasks.processing.process_thesaurus')
            self.assertEqual(Path(args[2]).read_bytes(), b'Authors,Title\nAntigo,Teste\n')
            self.assertEqual(Path(args[3]).read_bytes(), self.thesaurus)

    def test_database_formats(self):
        for database, content, column in [('scopus', b'Authors,Title\n"Antigo; Pessoa",Teste\n', 'Authors'), ('wos', b'AU\tTI\nAntigo; Pessoa\tTeste\n', 'AU')]:
            with self.subTest(database=database):
                result = authors_standardization(BytesIO(content), database, BytesIO(self.thesaurus))
                self.assertEqual(result[column][0], 'Final; Pessoa')
                self.assertEqual(len(result.columns), 2)

    def test_worker_processes_and_cleans_files(self):
        processing = self.processing
        with tempfile.TemporaryDirectory() as folder, patch.object(processing, 'OUTPUT_FOLDER', folder), patch.object(processing, 'db') as db:
            input_folder = Path(folder) / 'input'
            input_folder.mkdir()
            data = input_folder / 'data'
            thesaurus = input_folder / 'thesaurus'
            data.write_bytes(b'Authors,Title\nAntigo,Teste\n')
            thesaurus.write_bytes(self.thesaurus)
            analysis = SimpleNamespace(id=uuid4(), status='pending')
            db.session.get.return_value = analysis
            processing.process_thesaurus(str(analysis.id), str(data), str(thesaurus), 'scopus', str(input_folder))
            self.assertEqual(analysis.status, 'finished')
            self.assertFalse(input_folder.exists())
            result = pl.read_csv(Path(folder) / Path(analysis.download_url).name)
            self.assertEqual(result['Authors'][0], 'Final')
            self.assertIsNotNone(analysis.expires_at)

    def test_worker_failure_marks_error_and_cleans_files(self):
        processing = self.processing
        with tempfile.TemporaryDirectory() as folder, patch.object(processing, 'db') as db:
            input_folder = Path(folder) / 'input'
            input_folder.mkdir()
            analysis = SimpleNamespace(id=uuid4(), status='pending')
            db.session.get.return_value = analysis
            with patch.object(processing.logger, 'exception'), self.assertRaises(FileNotFoundError):
                processing.process_thesaurus(str(analysis.id), 'missing', str(input_folder / 'missing'), 'scopus', str(input_folder))
            self.assertEqual(analysis.status, 'error')
            self.assertFalse(input_folder.exists())

    def test_conflicting_and_malformed_rules(self):
        for content in (b'Header\nA | [X]\nB | [X]\n', b'Header\nA | X\n'):
            with self.subTest(content=content), self.assertRaises(ValueError):
                read_tesauro(BytesIO(content))


if __name__ == '__main__':
    unittest.main()
