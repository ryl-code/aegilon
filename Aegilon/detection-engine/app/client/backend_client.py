import os
import requests
import logging
from typing import List, Dict, Any, Optional

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

    def get_unprocessed_alerts(self) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/alerts/unprocessed"
        try:
            response = requests.get(url, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.get(url, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch unprocessed alerts: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error fetching unprocessed alerts: {str(e)}")
            return []

    def send_analysis(self, alert_id: str, risk_score: float, severity: str, action: str, analysis: str) -> bool:
        url = f"{self.base_url}/analysis"
        payload = {
            "alert_id": alert_id,
            "risk_score": risk_score,
            "severity": severity,
            "action": action,
            "analysis": analysis
        }
        try:
            response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code == 401:
                if self.login():
                    response = requests.post(url, json=payload, headers=self.get_headers(), timeout=30.0)
            if response.status_code in [200, 201]:
                logger.info(f"Successfully sent analysis for alert {alert_id}")
                return True
            else:
                logger.error(f"Failed to send analysis for alert {alert_id}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error sending analysis for alert {alert_id}: {str(e)}")
            return False

backend_client = BackendClient()
