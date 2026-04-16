import pandas as pd
import datetime
import re

def process_nl_query(df: pd.DataFrame, query: str):
    """
    Realistic AI Engine: 
    1. Filters data based on time-related phrases.
    2. Detects if the user wants a Route or Carrier analysis.
    3. Decides whether to show a Chart (Aggregation) or Table (Details).
    """
    # --- PRE-PROCESSING ---
    # Standardize query: remove punctuation and split into clean words
    q_clean = re.sub(r'[^\w\s]', '', query.lower()).strip()
    words = set(q_clean.split())
    
    df_working = df.copy()
    
    # Ensure data types are correct for math operations
    df_working['shipment_date'] = pd.to_datetime(df_working['shipment_date']).dt.normalize()
    df_working['delay_minutes'] = pd.to_numeric(df_working['delay_minutes'], errors='coerce').fillna(0)
    
    # Reference current time (April 2026)
    today = pd.Timestamp.now().normalize()
    
    # --- PHASE 1: SMART TIME FILTERING ---
    time_label = "All Time"
    
    # Detection for "Last X Months" (e.g., "last 3 months")
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
        
    elif "last month" in q_clean or "previous month" in q_clean:
        # Standard logic for the previous full calendar month
        first_of_this = today.replace(day=1)
        end_of_last = first_of_this - pd.Timedelta(days=1)
        start_of_last = end_of_last.replace(day=1)
        df_working = df_working[(df_working['shipment_date'] >= start_of_last) & 
                                (df_working['shipment_date'] <= end_of_last)]
        time_label = "Last Month"

    # --- PHASE 2: INTENT DETECTION (DIMENSION & METRIC) ---
    
    # Synonyms for Dimension
    route_triggers = {'route', 'routes', 'lane', 'lanes', 'path', 'destination', 'origin', 'from', 'to'}
    carrier_triggers = {'carrier', 'carriers', 'company', 'companies', 'fedex', 'ups', 'dhl', 'provider', 'who'}
    
    # Synonyms for Metric
    delay_triggers = {'delay', 'delays', 'late', 'behind', 'minutes', 'slow', 'performance'}

    # Determine what the user is asking about
    is_route_query = any(w in route_triggers for w in words)
    is_carrier_query = any(w in carrier_triggers for w in words)
    is_delay_query = any(w in delay_triggers for w in words)

    # --- PHASE 3: AGGREGATION & RESPONSE ---

    # Scenario A: User wants Route Analysis
    if is_route_query:
        # If they mention delay, SUM the minutes. Otherwise, COUNT the shipments.
        metric = "delay_minutes" if is_delay_query else "shipment_id"
        agg_func = "sum" if is_delay_query else "count"
        label = "Total Delay (Mins)" if is_delay_query else "Shipment Count"
        
        result_df = df_working.groupby("route")[metric].agg(agg_func).reset_index()
        result_df = result_df.sort_values(by=metric, ascending=False)
        
        return {
            "type": "chart",
            "chart_type": "bar",
            "title": f"{label} by Route ({time_label})",
            "data": result_df.to_dict(orient="records"),
            "x": "route",
            "y": metric
        }

    # Scenario B: User wants Carrier Analysis
    elif is_carrier_query:
        # Use MEAN (Average) for carrier performance, COUNT for market share
        metric = "delay_minutes" if is_delay_query else "shipment_id"
        agg_func = "mean" if is_delay_query else "count"
        label = "Avg Delay (Mins)" if is_delay_query else "Shipment Volume"
        
        result_df = df_working.groupby("carrier")[metric].agg(agg_func).reset_index()
        
        if agg_func == "mean":
            result_df[metric] = result_df[metric].round(1)
            
        result_df = result_df.sort_values(by=metric, ascending=False)
        
        return {
            "type": "chart",
            "chart_type": "pie",
            "title": f"{label} by Carrier ({time_label})",
            "data": result_df.to_dict(orient="records"),
            "x": "carrier",
            "y": metric
        }

    # Scenario C: Default Fallback (Table View)
    else:
        # If no specific grouping (route/carrier) is detected, return the detailed list
        # Sort by date descending so most recent is on top
        df_working = df_working.sort_values('shipment_date', ascending=False)
        
        return {
            "type": "table",
            "title": f"Shipment Detailed Log ({time_label})",
            "data": df_working.to_dict(orient="records")
        }