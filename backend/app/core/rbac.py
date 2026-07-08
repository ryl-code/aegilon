"""
This file handles Role-Based Access Control (RBAC) validations.
It defines allowed roles and a reusable permission checker to enforce access rights 
across various backend API endpoints according to the user's role.
"""

from typing import List
from fastapi import HTTPException, status
from app.models.user import User

# List of all valid roles supported by the system
VALID_ROLES = {"admin", "analyst"}

class RoleChecker:
    """
    Utility class to verify if a user possesses the required role permissions.
    Designed to prevent circular dependencies by separating the user-extraction dependency
    from the role-verification logic.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User) -> User:
        """
        Validate the user's role. Raises a 403 Forbidden exception if the user
        does not have a permitted role.
        """
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account"
            )
            
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Role does not permit this action"
            )
        return user
