import pandas as pd

def suggest_chart_metadata(df_result: pd.DataFrame, query_intent: str):
    """
    Analyzes the data to pick the best chart type.
    """
    cols = df_result.columns.tolist()
    
    # If the manager is looking at 'carrier' or 'status', a Pie chart is often best
    if 'carrier' in query_intent.lower() or len(df_result) <= 3:
        return {
            "chart_type": "pie",
            "x": cols[0],
            "y": cols[1] if len(cols) > 1 else cols[0]
        }
        
    # Default to Bar chart for routes, regions, or larger datasets
    return {
        "chart_type": "bar",
        "x": cols[0],
        "y": cols[1] if len(cols) > 1 else cols[0]
    }