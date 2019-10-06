import os


class Config:
    @classmethod
    def get_opencage_key(cls):
        return os.environ.get('KEY_OPENCAGEDATA', '')