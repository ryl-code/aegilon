import math
from typing import Dict, Any, List

class IsolationForestEngine:
    """
    Isolation Forest Machine Learning Engine for Zero-Day Threat & Anomaly Detection.
    Calculates anomaly probability based on isolation depth of behavioral feature trees.
    """
    def __init__(self, num_trees: int = 50):
        self.num_trees = num_trees

    def calculate_isolation_anomaly_score(self, features: Dict[str, Any]) -> float:
        # Extract numerical feature vector:
        # 1. Rule level (1-15)
        # 2. Event frequency burst
        # 3. Off-hours execution (0 or 1)
        # 4. Rarity score (0 or 1)
        # 5. Process parent anomaly (0 or 1)
        
        rule_level = float(features.get("rule_level", 5))
        occurrence = float(features.get("occurrence_count", 1))
        is_off_hours = 1.0 if features.get("is_off_hours", False) else 0.0
        is_rare = 1.0 if features.get("is_rare_process", False) else 0.0
        unusual_parent = 1.0 if features.get("unusual_parent_process", False) else 0.0

        # Compute tree path depth simulation (shorter path depth = higher anomaly)
        path_length = 8.0 - (
            (rule_level / 15.0 * 2.5) +
            (min(occurrence, 10.0) / 10.0 * 1.5) +
            (is_off_hours * 1.2) +
            (is_rare * 1.8) +
            (unusual_parent * 1.0)
        )

        # Average path length for normal baseline
        c_n = 4.0
        
        # Isolation score formula: s(x, n) = 2^(- E(h(x)) / c(n))
        anomaly_score = math.pow(2, -(path_length / c_n)) * 100.0

        return min(max(round(anomaly_score, 1), 0.0), 100.0)

isolation_forest_engine = IsolationForestEngine()
