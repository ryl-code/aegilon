from typing import Dict, Any

class AnomalyEngine:
    @staticmethod
    def calculate_anomaly_score(features: Dict[str, Any]) -> float:
        """
        Calculates Anomaly Score (0 - 100%) based on behavioral baseline deviation.
        """
        time_off_hours = features.get("is_off_hours", False)
        rare_process = features.get("is_rare_process", False)
        unusual_parent = features.get("unusual_parent_process", False)
        burst_frequency = features.get("burst_frequency_rate", 1.0)
        
        score = 0.0

        if time_off_hours:
            score += 25.0
        if rare_process:
            score += 35.0
        if unusual_parent:
            score += 25.0
            
        if burst_frequency > 5.0:
            score += 15.0
        elif burst_frequency > 2.0:
            score += 10.0

        # Clamp between 0 and 100
        return min(max(round(score, 1), 0.0), 100.0)

anomaly_engine = AnomalyEngine()
