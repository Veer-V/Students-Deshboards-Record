# Save as app.py

import streamlit as st
import pandas as pd
import joblib
import numpy as np
import plotly.express as px

st.set_page_config(page_title="Student Dashboard", layout="wide")

# Function to generate smart tips
def generate_tip(student_data):
    tips = []
    if student_data["Attendance_Percentage"] < 60:
        tips.append("📌 Improve attendance.")
    if student_data["Internal_Assessment_1"] < 15:
        tips.append("📝 Focus on Internal 1 topics.")
    if student_data["Participation_Score"] < 5:
        tips.append("🙋‍♂️ Engage more in class.")
    return " | ".join(tips) if tips else "🎯 You're on track!"

# Load model and data
model = joblib.load("model_pipeline.pkl")
df = pd.read_csv("student_performance_60.csv")

st.title("📊 Student Performance Dashboard")
st.markdown("Analyze student progress, identify risks, and provide recommendations.")

# Add overall stats
col1, col2, col3 = st.columns(3)
with col1:
    avg_attendance = round(df["Attendance_Percentage"].mean(), 2)
    st.metric("📅 Avg. Attendance (%)", avg_attendance)
with col2:
    pass_count = sum((model.predict(df[[
        "Internal_Assessment_1", "Internal_Assessment_2",
        "Attendance_Percentage", "Previous_Semester_Grade",
        "Participation_Score"
    ]]) >= 15))
    st.metric("✅ Students Predicted to Pass", pass_count)
with col3:
    st.metric("📈 Dataset Size", len(df))

st.markdown("---")

# Student selection
selected_student = st.selectbox("🎓 Select a Student", df["Name"])

student_data = df[df["Name"] == selected_student].iloc[0]
features = [[
    student_data["Internal_Assessment_1"],
    student_data["Internal_Assessment_2"],
    student_data["Attendance_Percentage"],
    student_data["Previous_Semester_Grade"],
    student_data["Participation_Score"]
]]

prediction = model.predict(features)[0]
result = "✅ Pass" if prediction >= 15 else "❌ Fail"

# Display result with colors
st.subheader(f"🎯 Prediction Result: {'🟢' if prediction >= 15 else '🔴'} {result}")
st.markdown(f"**💡 Recommendation:** {generate_tip(student_data)}")

# Expandable section for detailed data
with st.expander("📋 View Student Details"):
    st.dataframe(pd.DataFrame([student_data]))

# Charts (Bar)
st.markdown("### 📊 Performance Breakdown")
chart_df = pd.DataFrame({
    "Metrics": ["Internal 1", "Internal 2", "Attendance", "Previous Grade", "Participation"],
    "Values": [
        student_data["Internal_Assessment_1"],
        student_data["Internal_Assessment_2"],
        student_data["Attendance_Percentage"],
        student_data["Previous_Semester_Grade"],
        student_data["Participation_Score"]
    ]
})
fig = px.bar(chart_df, x="Metrics", y="Values", color="Values", text="Values", height=350)
st.plotly_chart(fig, use_container_width=True)

# Upload new data
st.markdown("---")
uploaded_file = st.file_uploader("📤 Upload updated student data (.csv)", type=["csv"])
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.success("✅ Data updated successfully! Refresh the page to reload.")
# Save the updated DataFrame to a new CSV file
    df.to_csv("updated_student_performance.csv", index=False)
    st.write("Updated data saved as 'updated_student_performance.csv'.")
# Footer
st.markdown("---")          