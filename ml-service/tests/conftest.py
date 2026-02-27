"""
Shared pytest fixtures.
Add fixtures here as ML features are built.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from src.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """Mock Supabase client — prevents real DB calls in tests."""
    with patch('src.database.get_supabase_client') as mock:
        mock_client = MagicMock()
        mock.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_mortality_data():
    """Sample mortality data rows for testing ML services."""
    return [
        {'country': 'Malaysia', 'cause_of_death': 'Heart Disease', 'year': 2022, 'death_count': 12500, 'age_group': '65-75'},
        {'country': 'Malaysia', 'cause_of_death': 'Cancer', 'year': 2022, 'death_count': 9800, 'age_group': '55-65'},
        {'country': 'Malaysia', 'cause_of_death': 'Heart Disease', 'year': 2023, 'death_count': 13100, 'age_group': '65-75'},
    ]
