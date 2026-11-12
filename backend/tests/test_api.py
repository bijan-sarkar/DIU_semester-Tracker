import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db
from seed_data import seed_database

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    await init_db()
    await seed_database()

@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_demo_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/auth/demo-login")
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "demo.student@diu.edu.bd"

@pytest.mark.asyncio
async def test_courses_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/courses?semester_level=Level%202%20Term%201")
        assert resp.status_code == 200
        courses = resp.json()
        assert len(courses) >= 1
        codes = [c["code"] for c in courses]
        assert "CSE-213" in codes

@pytest.mark.asyncio
async def test_course_detail_and_readiness():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login demo student
        login_res = await client.post("/api/v1/auth/demo-login")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Find CSE-213 (Algorithms)
        courses_res = await client.get("/api/v1/courses?search=CSE-213", headers=headers)
        course = courses_res.json()[0]
        course_id = course["id"]

        # Get course detail with progress
        detail_res = await client.get(f"/api/v1/courses/{course_id}", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert len(detail["topics"]) > 0

        # Check readiness analytics
        analytics_res = await client.get(f"/api/v1/analytics/course/{course_id}", headers=headers)
        assert analytics_res.status_code == 200
        analytics = analytics_res.json()
        assert "midterm" in analytics
        assert "final" in analytics
        assert analytics["midterm"]["weighted_readiness_pct"] > 0

@pytest.mark.asyncio
async def test_papers_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/papers?limit=5")
        assert resp.status_code == 200
        papers = resp.json()
        assert isinstance(papers, list)

@pytest.mark.asyncio
async def test_topic_progress_and_notes():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login demo student
        login_res = await client.post("/api/v1/auth/demo-login")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch courses & pick first topic
        courses_res = await client.get("/api/v1/courses?search=CSE-213", headers=headers)
        course = courses_res.json()[0]
        detail_res = await client.get(f"/api/v1/courses/{course['id']}", headers=headers)
        topic = detail_res.json()["topics"][0]

        # Update progress and notes
        prog_res = await client.post(
            "/api/v1/tracker/progress",
            json={
                "topic_id": topic["id"],
                "status": "completed",
                "notes": "Reviewed Big-O worst-case complexity and Master Theorem."
            },
            headers=headers
        )
        assert prog_res.status_code == 200
        data = prog_res.json()
        assert data["status"] == "completed"
        assert "Master Theorem" in data["notes"]

