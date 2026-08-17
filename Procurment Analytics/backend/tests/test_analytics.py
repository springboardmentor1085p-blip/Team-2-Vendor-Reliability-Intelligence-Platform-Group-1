from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_spend_summary():
    response = client.get("/analytics/spend/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_spend" in data
    assert "average_spend" in data
    assert "max_purchase" in data
    assert "min_purchase" in data
