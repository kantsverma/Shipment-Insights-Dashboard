import pandas as pd
import datetime
import re

def process_nl_query(df: pd.DataFrame, query: str):
    # 1. PRE-PROCESSING
    q_clean = re.sub(r'[^\w\s]', '', query.lower()).strip()
    words = set(q_clean.split())
    
    df_working = df.copy()
    # Ensure proper data types
    df_working['shipment_date'] = pd.to_datetime(df_working['shipment_date']).dt.normalize()
    df_working['delay_minutes'] = pd.to_numeric(df_working['delay_minutes'], errors='coerce').fillna(0)
    
    # Use April 2026 as reference point
    today = pd.Timestamp.now().normalize()
    
    # --- PHASE 1: TIME FILTERING ---
    time_label = "All Time"
    month_match = re.search(r'(?:last|past|previous)\s+(\d+)\s+month', q_clean)
    
    if any(k in words for k in ["current", "this", "today"]):
        start_date = today.replace(day=1)
        df_working = df_working[df_working['shipment_date'] >= start_date]
        time_label = "This Month"
    elif month_match:
        num_months = int(month_match.group(1))
        start_date = today - pd.DateOffset(months=num_months)
        df_working = df_working[df_working['shipment_date'] >= start_date]
        time_label = f"Last {num_months} Months"
    elif "last month" in q_clean:
        first_this = today.replace(day=1)
        end_last = first_this - pd.Timedelta(days=1)
        start_last = end_last.replace(day=1)
        df_working = df_working[(df_working['shipment_date'] >= start_last) & (df_working['shipment_date'] <= end_last)]
        time_label = "Last Month"

    # --- PHASE 2: DIMENSION DETECTION ---
    # Default to 'route' unless 'carrier' keywords are found
    carrier_triggers = {'carrier', 'carriers', 'fedex', 'ups', 'dhl', 'company'}
    dimension = "carrier" if not words.isdisjoint(carrier_triggers) else "route"
    
    # Aggregated data for the top charts
    chart_df = df_working.groupby(dimension)["delay_minutes"].sum().reset_index()
    chart_df = chart_df.sort_values("delay_minutes", ascending=False)

    # --- PHASE 3: THE PACKAGE ---
    return {
        "type": "dashboard",
        "config": {
            "x": dimension,
            "y": "delay_minutes",
            "time_label": time_label
        },
        "chart_data": chart_df.to_dict(orient="records"),
        "table_data": df_working.sort_values('shipment_date', ascending=False).to_dict(orient="records")
    }