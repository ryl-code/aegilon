import os
import requests
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class BackendClient:
    def __init__(self):
        self.base_url = os.getenv("BACKEND_API_URL", "http://backend:8080")
        self.username = os.getenv("BACKEND_USER", "admin@aegilon.com")
        self.password = os.getenv("BACKEND_PASSWORD")
        self.token = None

    def login(self) -> bool:
        url = f"{self.base_url}/auth/login"
        try:
            response = requests.post(
                url,
                data={"username": self.username, "password": self.password},
                timeout=30.0
            )
            if response.status_code == 200:
                self.token = response.json().get("access_token")
                logger.info("Successfully authenticated with Backend API.")
                return True
            else:
                logger.error(f"Failed to authenticate: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error connecting to backend for auth: {str(e)}")
            return False

    def get_headers(self) -> Dict[str, str]:
        if not self.token:
            self.login()
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def get_respondable_incidents(self) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/incidents/respondable"
        try:
            response = requests.get(url, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.get(url, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch respondable incidents: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error fetching respondable incidents: {str(e)}")
            return []

    def send_telegram_notification(self, incident_id: str, severity: str, risk_score: float, title: str, host: str, recommendation: str) -> bool:
        url = f"{self.base_url}/api/notifications/telegram"
        payload = {
            "incident_id": incident_id,
            "severity": severity,
            "risk_score": risk_score,
            "title": title,
            "host": host,
            "recommendation": recommendation
        }
        try:
            response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code in [200, 201]:
                return True
            else:
                logger.error(f"Failed to send Telegram notification: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error sending Telegram notification: {str(e)}")
            return False

    def trigger_wazuh_active_response(self, agent_id: str, command: str, arguments: List[str]) -> bool:
        url = f"{self.base_url}/api/wazuh/active-response"
        payload = {
            "agent_id": agent_id,
            "command": command,
            "arguments": arguments
        }
        try:
            response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code in [200, 201]:
                return True
            else:
                logger.error(f"Failed to trigger Wazuh Active Response: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error triggering Wazuh Active Response: {str(e)}")
            return False

    def save_response_history(self, incident_id: str, action: str, status: str, message: str) -> bool:
        url = f"{self.base_url}/api/responses"
        payload = {
            "incident_id": incident_id,
            "action": action,
            "status": status,
            "message": message
        }
        try:
            response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code in [200, 201]:
                return True
            else:
                logger.error(f"Failed to save response history: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error saving response history: {str(e)}")
            return False

    def update_incident_status(self, incident_id: str, status: str) -> bool:
        url = f"{self.base_url}/api/incidents/{incident_id}"
        payload = {
            "status": status
        }
        try:
            response = requests.patch(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.patch(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 200:
                return True
            else:
                logger.error(f"Failed to update incident status to {status}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error updating incident status: {str(e)}")
            return False

backend_client = BackendClient()
