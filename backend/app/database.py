import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_engine():
    # Attempt Oracle DB if driver is available and config supplied
    if settings.DB_USER and settings.DB_PASSWORD and settings.DB_DSN:
        try:
            import oracledb
            oracle_url = f"oracle+oracledb://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_DSN}"
            engine = create_engine(oracle_url, pool_pre_ping=True)
            with engine.connect() as conn:
                logger.info("Connected successfully to Oracle Database (Thin Mode).")
            return engine, "oracle"
        except (ImportError, Exception) as e:
            logger.warning(f"Oracle DB connection unavailable ({e}). Defaulting to local SQLite.")

    # Fallback to SQLite
    sqlite_url = "sqlite:///./foodbridge.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    logger.info("Using SQLite database (./foodbridge.db).")
    return engine, "sqlite"

engine, DB_TYPE = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
