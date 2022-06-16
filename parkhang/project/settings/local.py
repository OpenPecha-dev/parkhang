from .base import *
from .base import env

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = True
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="HWzwRDJe8mOsoVelwTasHLxUCnbThneDYhZs7DpRcbCDhDOlZosN2P2qvrRcosIR",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1"]
# SECURITY WARNING: keep the secret key used in production secret!

INSTALLED_APPS += ["django_extensions"]

