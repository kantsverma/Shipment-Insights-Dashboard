import pandas as pd
import io
from typing import Tuple, Optional

def validate_and_parse_csv(contents: bytes) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Reads the CSV, ensures required columns exist, handles dates, 
    and removes future-dated entries.
    """
    try:
        # Load the CSV
        df = pd.read_csv(io.BytesIO(contents))
        
        # 1. Schema Validation
        # Added 'shipment_date' to the required list for time-based queries
        required_columns = ['shipment_id', 'carrier', 'route', 'delay_minutes', 'shipment_date']
        
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            return None, f"Missing required columns: {', '.join(missing)}"
        
        # 2. Numeric Cleaning
        # Ensure delay is a number so math operations (sum/mean) don't crash
        df['delay_minutes'] = pd.to_numeric(df['delay_minutes'], errors='coerce').fillna(0)
        
        # 3. Date Parsing & Safety Filter
        # Convert to datetime objects
        df['shipment_date'] = pd.to_datetime(df['shipment_date'], errors='coerce')
        
        # Drop rows where the date is completely unreadable
        df = df.dropna(subset=['shipment_date'])
        
        # --- REQUIREMENT: No future months ---
        # Get the current system time
        now = pd.Timestamp.now()
        
        # Filter out any shipments that have a date later than 'now'
        df = df[df['shipment_date'] <= now]
        
        # Optional: Sort by date descending so "recent" shipments appear first
        df = df.sort_values(by='shipment_date', ascending=False)
        
        return df, None

    except Exception as e:
        return None, f"Error parsing CSV: {str(e)}"