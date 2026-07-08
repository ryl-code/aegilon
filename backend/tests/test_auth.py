import uuid
import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_auth_flow():
    """
    Test the complete authentication flow automatically:
    1. Register a new user.
    2. Try to register the same username again (should fail with 400).
    3. Login with correct credentials (should return JWT access/refresh tokens).
    4. Login with incorrect credentials (should fail with 400).
    5. Retrieve current user profile using JWT (should return 200).
    6. Retrieve current user profile without JWT (should fail with 401).
    """
    # Generate unique credentials to avoid test database pollution
    unique_suffix = uuid.uuid4().hex[:8]
    test_username = f"user_{unique_suffix}"
    test_email = f"user_{unique_suffix}@example.com"
    test_password = "supersecretpassword123"

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        
        # 1. Test Registration
        register_payload = {
            "username": test_username,
            "email": test_email,
            "password": test_password,
            "role": "analyst"
        }
        reg_response = await client.post("/api/v1/auth/register", json=register_payload)
        assert reg_response.status_code == 201, reg_response.text
        reg_data = reg_response.json()
        assert reg_data["success"] is True
        assert reg_data["data"]["username"] == test_username
        assert reg_data["data"]["email"] == test_email
        assert reg_data["data"]["role"] == "analyst"

        # 2. Test Duplicate Registration (should fail with 400)
        dup_response = await client.post("/api/v1/auth/register", json=register_payload)
        assert dup_response.status_code == 400
        assert "already registered" in dup_response.json()["detail"].lower()

        # 3. Test Successful Login
        login_payload = {
            "username": test_username,
            "password": test_password
        }
        login_response = await client.post("/api/v1/auth/login", json=login_payload)
        assert login_response.status_code == 200, login_response.text
        token_data = login_response.json()
        assert "access_token" in token_data
        assert "refresh_token" in token_data
        assert token_data["role"] == "analyst"
        assert token_data["token_type"] == "bearer"

        access_token = token_data["access_token"]

        # 4. Test Failed Login (wrong password)
        bad_login_payload = {
            "username": test_username,
            "password": "wrongpassword"
        }
        bad_login_response = await client.post("/api/v1/auth/login", json=bad_login_payload)
        assert bad_login_response.status_code == 400
        assert "invalid" in bad_login_response.json()["detail"].lower()

        # 5. Test Access /me with JWT (should succeed)
        headers = {"Authorization": f"Bearer {access_token}"}
        me_response = await client.get("/api/v1/auth/me", headers=headers)
        assert me_response.status_code == 200, me_response.text
        me_data = me_response.json()
        assert me_data["success"] is True
        assert me_data["data"]["username"] == test_username
        assert me_data["data"]["email"] == test_email

        # 6. Test Access /me without JWT (should fail with 401)
        no_auth_response = await client.get("/api/v1/auth/me")
        assert no_auth_response.status_code == 401
