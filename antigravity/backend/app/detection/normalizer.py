import os

class Normalizer:
    @staticmethod
    def normalize_process_name(name: str) -> str:
        if not name:
            return ""
        return name.strip().lower()

    @staticmethod
    def normalize_path(path: str) -> str:
        if not path:
            return ""
        return path.strip().replace("\\", "/").lower()

    @staticmethod
    def normalize_cmdline(cmdline: str) -> str:
        if not cmdline:
            return ""
        return cmdline.strip().lower()

normalizer = Normalizer()
