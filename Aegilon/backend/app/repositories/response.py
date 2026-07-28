from app.repositories.base import BaseRepository
from app.models.response import Response

class ResponseRepository(BaseRepository[Response]):
    def __init__(self):
        super().__init__(Response)

response_repo = ResponseRepository()
